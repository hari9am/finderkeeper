import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import ItemCard from "@/components/ItemCard";
import SuccessStory from "@/components/SuccessStory";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import walletImage from "@assets/generated_images/Lost_wallet_item_photo_ebc7ad65.png";
import dogImage from "@assets/generated_images/Found_dog_item_photo_4aed6d43.png";
import keysImage from "@assets/generated_images/Lost_keys_item_photo_bc6d5d42.png";
import avatarFemale from "@assets/generated_images/Female_user_avatar_4e1110ae.png";
import avatarMale from "@assets/generated_images/Male_user_avatar_f4d5e230.png";

export default function Home() {
  return (
    <div>
      <Hero />
      
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Search Recent Posts
            </h2>
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Recent Lost & Found Items</h2>
              <p className="text-muted-foreground">Help reunite these items with their owners</p>
            </div>
            <Button variant="outline" data-testid="button-view-all">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ItemCard
              id="1"
              title="Black Leather Wallet"
              description="Lost black leather wallet with cards and ID inside. Last seen near Central Park."
              category="Wallets & Purses"
              location="Central Park, NY"
              date="Oct 28, 2025"
              imageUrl={walletImage}
              status="lost"
            />
            <ItemCard
              id="2"
              title="Golden Retriever"
              description="Found friendly golden retriever in downtown area. Wearing blue collar, no tags."
              category="Pets"
              location="Downtown, NY"
              date="Oct 29, 2025"
              imageUrl={dogImage}
              status="found"
              aiMatch={true}
            />
            <ItemCard
              id="3"
              title="Set of Keys"
              description="Found keys with blue keychain near the subway station. Multiple keys on ring."
              category="Keys"
              location="Metro Station, NY"
              date="Oct 30, 2025"
              imageUrl={keysImage}
              status="found"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Matching</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How Our Smart Matching Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes photos and descriptions to automatically find potential matches between lost and found items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload & Describe</h3>
              <p className="text-sm text-muted-foreground">
                Post your lost or found item with photos and detailed description
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our system automatically scans and matches similar items
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Notified</h3>
              <p className="text-sm text-muted-foreground">
                Receive instant alerts when potential matches are found
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground">Real people reunited with their belongings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <SuccessStory
              userName="Sarah Chen"
              userAvatar={avatarFemale}
              itemName="Wedding Ring"
              story="I lost my wedding ring at the gym and thought I'd never see it again. Thanks to this platform, someone found it and returned it within 24 hours. Forever grateful!"
              location="Brooklyn, NY"
              karmaEarned={50}
            />
            <SuccessStory
              userName="Marcus Johnson"
              userAvatar={avatarMale}
              itemName="Lost Dog"
              story="Our family dog ran away during a storm. The community here helped us find him the very next day. This platform is amazing!"
              location="Austin, TX"
              karmaEarned={100}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find What You've Lost?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of people who have successfully reunited with their belongings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" data-testid="button-cta-post">
              Post Lost Item
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-cta-browse">
              Browse Found Items
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
