import StatsCard from "@/components/StatsCard";
import ItemCard from "@/components/ItemCard";
import { Package, CheckCircle, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import walletImage from "@assets/generated_images/Lost_wallet_item_photo_ebc7ad65.png";
import keysImage from "@assets/generated_images/Lost_keys_item_photo_bc6d5d42.png";

export default function Dashboard() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your posts and activity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Posts" value="2" icon={Package} />
          <StatsCard title="Active Items" value="2" icon={TrendingUp} />
          <StatsCard title="Successful Matches" value="0" icon={CheckCircle} />
          <StatsCard title="Karma Points" value="0" icon={Award} />
        </div>

        <Tabs defaultValue="my-posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-posts" data-testid="tab-my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">Potential Matches</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="my-posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Posted Items</h2>
              <Button data-testid="button-new-post">New Post</Button>
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
          </TabsContent>

          <TabsContent value="matches">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
              <p className="text-muted-foreground">
                Our AI will notify you when potential matches are found
              </p>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Messages</h3>
              <p className="text-muted-foreground">
                Your conversations will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
