"use client";

import { 
  Button, 
  Card, 
  CardBody,
  CardHeader,
  Input,
  Badge,
  Spinner
} from "@heroui/react";
import { useState, useEffect } from "react";

interface ServiceDashboardProps {
  serviceName: string;
}

export function ServiceDashboard({ serviceName }: ServiceDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceData, setServiceData] = useState<{
    service: string;
    status: string;
    timestamp: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");

  const fetchServiceData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${serviceName}`);
      const data = await response.json();
      setServiceData(data);
    } catch (error) {
      console.error("Service data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceAction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${serviceName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: inputValue }),
      });
      const result = await response.json();
      console.log("Service action result:", result);
      await fetchServiceData(); // データを再取得
    } catch (error) {
      console.error("Service action error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, []); // 初回のみ実行

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-medium font-bold text-nidomi-primary">
          {serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Dashboard
        </h2>
        <Badge color="success" variant="flat">
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Status */}
        <Card className="border border-nidomi-outline-variant">
          <CardHeader>
            <h3 className="text-small font-bold">Service Status</h3>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" color="primary" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-small">
                  Status: <span className="text-nidomi-primary font-medium">
                    {serviceData?.status || "Unknown"}
                  </span>
                </p>
                <p className="text-small">
                  Service: <span className="text-nidomi-surface-variant-foreground">
                    {serviceData?.service || "N/A"}
                  </span>
                </p>
                <p className="text-small">
                  Last Updated: <span className="text-nidomi-surface-variant-foreground">
                    {serviceData?.timestamp ? new Date(serviceData.timestamp).toLocaleString() : "N/A"}
                  </span>
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Service Actions */}
        <Card className="border border-nidomi-outline-variant">
          <CardHeader>
            <h3 className="text-small font-bold">Service Actions</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Action Command"
                placeholder="Enter service action"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                variant="bordered"
                size="sm"
              />
              <div className="flex gap-2">
                <Button 
                  color="primary" 
                  onClick={handleServiceAction}
                  isLoading={isLoading}
                  className="flex-1"
                  size="sm"
                >
                  Execute
                </Button>
                <Button 
                  variant="bordered" 
                  onClick={fetchServiceData}
                  isLoading={isLoading}
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
