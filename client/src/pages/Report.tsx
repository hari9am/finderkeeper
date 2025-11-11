import { useRef, useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export default function Report() {
  const [, navigate] = useLocation();
  const [isEdit, params] = useRoute("/report/:id");
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLoc] = useState("");
  const [date, setDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-fill contact information from user profile when not editing
  useEffect(() => {
    if (user && !isEdit && !contactName && !contactPhone) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      if (fullName) {
        setContactName(fullName);
      }
      if (user.phone) {
        setContactPhone(user.phone);
      }
    }
  }, [user, isEdit, contactName, contactPhone]);

  // Load existing item if in edit mode
  // Use the id value in the dependency array so the effect doesn't run on
  // every render due to params object identity changes. This prevents
  // overwriting user edits while typing.
  const editId = params?.id;
  useEffect(() => {
    async function load() {
      if (!isEdit) return;
      try {
        setError(null);
        const res = await fetch(`/api/items/${editId}`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const item = await res.json();
        setTitle(item.title || "");
        setDescription(item.description || "");
        setCategory(item.category || "");
        setLoc(item.location || "");
        const d = item.date ? new Date(item.date) : null;
        setDate(d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "");
        setImageUrl(item.imageUrl || undefined);
        setContactName(item.contactName || "");
        setContactPhone(item.contactPhone || "");
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Failed to load item');
      }
    }
    load();
  }, [isEdit, editId]);

  async function onPickLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setError(null);
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          
          try {
            // Try multiple geocoding services for better accuracy
            let locationString = "";
            
            // Primary: OpenStreetMap Nominatim (more detailed)
            try {
              const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );
              const nominatimData = await nominatimResponse.json();
              
              if (nominatimData?.address) {
                const addr = nominatimData.address;
                // Build more accurate location string
                const parts = [
                  addr.house_number && addr.road ? `${addr.house_number} ${addr.road}` : addr.road,
                  addr.suburb || addr.neighbourhood || addr.quarter,
                  addr.city || addr.town || addr.village || addr.municipality,
                  addr.state || addr.province,
                  addr.country_code?.toUpperCase()
                ].filter(Boolean);
                
                locationString = parts.join(", ");
                
                // If we have a good result, use it
                if (locationString && parts.length >= 2) {
                  const acc = Number.isFinite(accuracy) ? ` (~${Math.round(accuracy)}m accuracy)` : "";
                  setLoc(`${locationString}${acc}`);
                  resolve();
                  return;
                }
              }
            } catch (nominatimError) {
              console.warn("Nominatim geocoding failed:", nominatimError);
            }
            
            // Fallback: Use coordinates with basic reverse geocoding
            try {
              const basicResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              const basicData = await basicResponse.json();
              
              if (basicData?.display_name) {
                // Extract meaningful parts from display_name
                const displayParts = basicData.display_name.split(", ");
                const meaningfulParts = displayParts.slice(0, 4).filter((part: string) => 
                  !part.match(/^\d+$/) && // Remove pure numbers
                  part.length > 1 && // Remove single characters
                  !part.match(/^[A-Z]{2,3}$/) // Remove country codes
                );
                locationString = meaningfulParts.join(", ");
              }
            } catch (basicError) {
              console.warn("Basic geocoding failed:", basicError);
            }
            
            // Final fallback: coordinates only
            if (!locationString) {
              locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
            
            const acc = Number.isFinite(accuracy) ? ` (~${Math.round(accuracy)}m accuracy)` : "";
            setLoc(`${locationString}${acc}`);
            resolve();
            
          } catch (error) {
            console.error("Location geocoding error:", error);
            setLoc(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            resolve();
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(`Unable to retrieve your location: ${error.message}`);
          resolve();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, // Increased timeout
          maximumAge: 60000 // Allow cached location up to 1 minute
        }
      );
    });
  }

  async function processFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setImageUrl(data.url);

    } catch (err: any) {
      setError(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  async function openCamera() {
    try {
      setError(null);
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setError("Camera access denied or unavailable");
      setShowCamera(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function closeCamera() {
    stopCamera();
    setShowCamera(false);
  }

  async function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    await new Promise<void>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve();
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        await processFile(file);
        resolve();
      }, "image/jpeg", 0.9);
    });
    closeCamera();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!category) {
        setError("Please choose a category");
        setLoading(false);
        return;
      }
      
      // Require a photo when creating a new reported/found item.
      if (!isEdit && !imageUrl) {
        setError("Please attach a photo for reported/found items");
        setLoading(false);
        return;
      }
      const basePayload: any = {
        title,
        description,
        category,
        location,
        date,
        status: "found",
      };
      if (imageUrl) basePayload.imageUrl = imageUrl;
      if (contactName) basePayload.contactName = contactName;
      if (contactPhone) basePayload.contactPhone = contactPhone;

      if (isEdit) {
        const res = await apiRequest("PUT", `/api/items/${params!.id}`, basePayload);
        await res.json();
        // Refresh item lists
        await queryClient.invalidateQueries({ queryKey: ["/api/items"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/user/items"] });
        navigate(`/dashboard`);
      } else {
        const res = await apiRequest("POST", "/api/items", basePayload);
        await res.json();
        // Refresh browse list
        await queryClient.invalidateQueries({ queryKey: ["/api/items"] });
        navigate(`/browse`);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to report item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Found Item' : 'Report Found Item'}</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="space-y-2">
          <label className="text-sm font-medium">Photo</label>
          <div
            className={
              `flex flex-col items-center justify-center rounded-md border-2 border-dashed ${dragActive ? 'border-primary bg-primary/5' : 'border-muted'} p-6 text-center`
            }
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="text-sm text-muted-foreground">
              Drag and drop an image here
            </div>

        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-xl">
              <div className="aspect-video w-full overflow-hidden rounded">
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button type="button" variant="secondary" onClick={closeCamera}>Cancel</Button>
                <Button type="button" onClick={capturePhoto}>Capture</Button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="default" onClick={() => fileInputRef.current?.click()}>Choose File</Button>
              <Button type="button" variant="secondary" onClick={openCamera}>Take Photo</Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
          </div>
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {imageUrl && (
            <div className="rounded-md border border-dashed p-2">
              <img src={imageUrl} alt="Uploaded preview" className="h-48 w-full object-cover rounded" />
              <p className="mt-1 text-xs text-muted-foreground">Preview</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Wallets & Purses">Wallets & Purses</SelectItem>
              <SelectItem value="Keys">Keys</SelectItem>
              <SelectItem value="Pets">Pets</SelectItem>
              <SelectItem value="Bags">Bags</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Jewelry">Jewelry</SelectItem>
              <SelectItem value="Documents">Documents</SelectItem>
              <SelectItem value="IDs">IDs</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Toys">Toys</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
              <SelectItem value="Eyewear">Eyewear</SelectItem>
              <SelectItem value="Books">Books</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <div className="flex gap-2 items-center">
          <Input placeholder="Location" value={location} onChange={(e) => setLoc(e.target.value)} required />
          <Button type="button" variant="outline" onClick={onPickLocation}>Use current</Button>
        </div>
        <Input placeholder="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input placeholder="Your name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <Input placeholder="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? (isEdit ? "Saving..." : "Reporting...") : (isEdit ? "Update Found Item" : "Report Item")}</Button>
      </form>
    </div>
  );
}
