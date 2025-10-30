import { Accordion } from "@/components/ui/accordion";
import FAQItem from "@/components/FAQItem";

export default function FAQ() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Everything you need to know about using FindIt
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <FAQItem
            value="item-1"
            question="How does the AI matching system work?"
            answer="Our AI analyzes the descriptions and photos of lost and found items to identify potential matches. When similarities are detected, both parties are notified automatically. The system uses advanced image recognition to compare visual features and natural language processing to understand item descriptions."
          />
          <FAQItem
            value="item-2"
            question="Is it free to post items?"
            answer="Yes! Posting lost or found items is completely free. Our platform is community-driven and designed to help people reconnect with their belongings. We believe in making the service accessible to everyone."
          />
          <FAQItem
            value="item-3"
            question="How do I contact someone about an item?"
            answer="Once you find a potential match, use our secure messaging system to connect with the other user. Your personal contact information remains private until you choose to share it. All messages are monitored for safety and security."
          />
          <FAQItem
            value="item-4"
            question="What should I do if I find an item?"
            answer="Click the 'Report Found Item' button and fill out the form with as much detail as possible. Include clear photos, the location where you found it, and any identifying features. Our AI will automatically search for potential matches with lost item reports."
          />
          <FAQItem
            value="item-5"
            question="How long do posts stay active?"
            answer="Posts remain active for 90 days by default. After that, they are archived but can be reactivated if needed. You can also manually mark an item as 'resolved' when it's been returned to its owner."
          />
          <FAQItem
            value="item-6"
            question="What are Karma Points?"
            answer="Karma Points are earned when you successfully help return items to their owners. They're a way to recognize and celebrate community members who actively contribute to reuniting people with their belongings. Points can unlock special badges and recognition on your profile."
          />
          <FAQItem
            value="item-7"
            question="Is my personal information safe?"
            answer="Yes, we take privacy seriously. Your contact information is never shared publicly. You control what information you share and when. All communications through our platform are secure and encrypted."
          />
          <FAQItem
            value="item-8"
            question="Can I edit or delete my post?"
            answer="Yes, you can edit your post at any time from your dashboard. If an item has been found or you no longer need the post active, you can mark it as resolved or delete it entirely."
          />
        </Accordion>
      </div>
    </div>
  );
}
