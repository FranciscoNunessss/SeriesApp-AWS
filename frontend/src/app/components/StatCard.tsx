import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, trend, iconColor = 'text-blue-600' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl text-gray-900">{value}</p>
            {trend && <p className="text-xs text-gray-500">{trend}</p>}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${iconColor.replace('text-', 'bg-')}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
