import { Accordion } from "@/components/ui/accordion";
import FAQItem from "../FAQItem";

export default function FAQItemExample() {
  return (
    <div className="p-8 max-w-3xl">
      <Accordion type="single" collapsible>
        <FAQItem
          value="item-1"
          question="How does the AI matching system work?"
          answer="Our AI analyzes the descriptions and photos of lost and found items to identify potential matches. When similarities are detected, both parties are notified automatically."
        />
        <FAQItem
          value="item-2"
          question="Is it free to post items?"
          answer="Yes! Posting lost or found items is completely free. Our platform is community-driven and designed to help people reconnect with their belongings."
        />
        <FAQItem
          value="item-3"
          question="How do I contact someone about an item?"
          answer="Once you find a potential match, use our secure messaging system to connect with the other user. Your personal contact information remains private until you choose to share it."
        />
      </Accordion>
    </div>
  );
}
