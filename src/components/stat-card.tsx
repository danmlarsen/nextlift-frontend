import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  value,
  label,
  sub,
}: {
  value: React.ReactNode;
  label: string;
  sub?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center space-y-2 text-center">
        <p className="text-3xl font-bold lg:text-4xl">{value}</p>
        <p className="text-muted-foreground">{label}</p>
        {sub}
      </CardContent>
    </Card>
  );
}
