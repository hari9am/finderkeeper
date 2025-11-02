import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Community_helping_hero_image_0b604dab.png";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
          Reunite Lost Items with Their Owners
        </h1>
        <p className="text-base md:text-lg mb-6 max-w-2xl text-white/90">
          Join our community-powered platform to find what you've lost or help return what you've found
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link href="/post">
            <Button size="default" className="backdrop-blur-md bg-primary/90 hover:bg-primary border border-primary-border" data-testid="button-post-lost-item">
              <Search className="w-5 h-5 mr-2" />
              Post Lost Item
            </Button>
          </Link>
          <Link href="/report">
            <Button size="default" variant="outline" className="backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/30 text-white" data-testid="button-report-found">
              Report Found Item
            </Button>
          </Link>
        </div>

        
      </div>
    </section>
  );
}
