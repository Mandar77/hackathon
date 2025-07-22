import { Card } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  description: string;
  gradient: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  value,
  description,
  gradient,
}) => {
  return (
    <Card
      className={`p-6 ${gradient} text-white transform hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-sm">{description}</p>
    </Card>
  );
};
