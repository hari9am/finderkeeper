import { useState, useRef, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Post() {
  const [, navigate] = useLocation();
  const [isEdit, params] = useRoute("/post/:id");
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
  const [curLat, setCurLat] = useState<number | null>(null);
  const [curLon, setCurLon] = useState<number | null>(null);
  const [curAccuracy, setCurAccuracy] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load existing item if in edit mode
  useEffect(() => {
    async function load() {
      if (!isEdit) return;
      try {
        setError(null);
        const res = await fetch(`/api/items/${params!.id}`, { credentials: "include" });
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
  }, [isEdit, params]);

  async function onPickLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setError(null);
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurLat(latitude);
          setCurLon(longitude);
          setCurAccuracy(Number.isFinite(accuracy) ? accuracy : null);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then((r) => r.json())
            .then((data) => {
              const city = data?.address?.city || data?.address?.town || data?.address?.village;
              const suburb = data?.address?.suburb || data?.address?.neighbourhood;
              const state = data?.address?.state;
              const country = data?.address?.country_code?.toUpperCase();
              const parts = [suburb, city, state, country].filter(Boolean);
              const area = parts.join(", ") || data?.display_name || "";
              const acc = Number.isFinite(accuracy) ? ` ~${Math.round(accuracy)}m` : "";
              setLoc(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}${area ? ` (${area})` : ""}${acc}`);
              resolve();
            })
            .catch(() => {
              setLoc(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              resolve();
            });
        },
        () => {
          setError("Unable to retrieve your location");
          resolve();
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  // Removed auto-category suggestion to keep user in control

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
      if (isEdit) {
        await apiRequest("PUT", `/api/items/${params!.id}`, {
          title,
          description,
          category,
          location,
          date,
          imageUrl,
          contactName,
          contactPhone,
        });
        navigate(`/dashboard`);
      } else {
        const res = await apiRequest("POST", "/api/items", {
          title,
          description,
          category,
          location,
          date,
          status: "lost",
          imageUrl,
          contactName,
          contactPhone,
        });
        await res.json();
        navigate(`/browse`);
      }
    } catch (err: any) {
      setError(typeof err?.message === 'string' ? err.message : "Failed to create item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? "Edit Item" : "Post Lost Item"}</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="space-y-2">
          <label className="text-sm font-medium">Photo</label>
          <div
            className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed ${dragActive ? 'border-primary bg-primary/5' : 'border-muted'} p-6 text-center`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="text-sm text-muted-foreground">Drag and drop an image here</div>

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
        {error && <p className="text-red-600 text-sm break-words whitespace-pre-wrap">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? (isEdit ? "Saving..." : "Posting...") : (isEdit ? "Update Item" : "Post Item")}</Button>
      </form>
    </div>
  );
}
