import ItemCard from "../ItemCard";
import walletImage from "@assets/generated_images/Lost_wallet_item_photo_ebc7ad65.png";
import dogImage from "@assets/generated_images/Found_dog_item_photo_4aed6d43.png";

export default function ItemCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
