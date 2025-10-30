import SafetyTip from "@/components/SafetyTip";
import { MapPin, Users, Shield, Camera, Clock, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";

export default function Safety() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Safety Guidelines
          </h1>
          <p className="text-muted-foreground">
            Follow these tips to ensure safe and successful item exchanges
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Meeting in Person</h2>
            <div className="space-y-4">
              <SafetyTip
                icon={MapPin}
                title="Choose Public Locations"
                description="Always arrange meetups in well-lit, public locations like coffee shops, police stations, or busy shopping centers. Many police departments offer designated safe exchange zones."
              />
              <SafetyTip
                icon={Users}
                title="Bring a Friend"
                description="Consider bringing someone with you when meeting to exchange items, especially for high-value belongings. There's safety in numbers."
              />
              <SafetyTip
                icon={Clock}
                title="Meet During Daylight"
                description="Schedule meetups during daylight hours when possible. If you must meet in the evening, choose well-lit areas with plenty of people around."
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Verifying Ownership</h2>
            <div className="space-y-4">
              <SafetyTip
                icon={Shield}
                title="Ask Specific Questions"
                description="Request specific details about the item that only the true owner would know. For example, ask about unique markings, contents, or the exact circumstances of when it was lost."
              />
              <SafetyTip
                icon={Camera}
                title="Request Additional Photos"
                description="If you're unsure, ask the claimant to provide additional photos or proof of ownership such as receipts, photos showing them with the item, or documentation."
              />
              <SafetyTip
                icon={CheckCircle}
                title="Trust Your Instincts"
                description="If something feels off or too good to be true, trust your gut. Don't feel pressured to proceed with an exchange if you have doubts."
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Online Safety</h2>
            <div className="space-y-4">
              <SafetyTip
                icon={MessageSquare}
                title="Use Platform Messaging"
                description="Keep all communications within our secure messaging system until you're confident about the exchange. This provides a record and helps protect your privacy."
              />
              <SafetyTip
                icon={AlertTriangle}
                title="Protect Personal Information"
                description="Never share your home address, financial information, or other sensitive details until you've verified the other person's legitimacy."
              />
              <SafetyTip
                icon={Camera}
                title="Document Everything"
                description="Take photos of found items when you discover them and keep records of all communications. This documentation can be helpful if disputes arise."
              />
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl p-6 border">
            <h3 className="font-semibold mb-2">Report Suspicious Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you encounter suspicious behavior, scams, or feel unsafe at any point, please report it immediately to our support team. We take all reports seriously and will investigate promptly.
            </p>
            <p className="text-sm text-muted-foreground">
              For emergencies, always contact your local authorities first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
