import SuccessStory from "../SuccessStory";
import avatarFemale from "@assets/generated_images/Female_user_avatar_4e1110ae.png";
import avatarMale from "@assets/generated_images/Male_user_avatar_f4d5e230.png";

export default function SuccessStoryExample() {
  return (
    <div className="p-8 space-y-4 max-w-2xl">
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
  );
}
