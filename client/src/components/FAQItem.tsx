import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItemProps {
  question: string;
  answer: string;
  value: string;
}

export default function FAQItem({ question, answer, value }: FAQItemProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-left" data-testid={`accordion-${value}`}>
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground" data-testid={`text-answer-${value}`}>
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
