"use client";

import { 
  Button as HeroButton, 
  Card as HeroCard, 
  CardBody as HeroCardBody,
  Input as HeroInput,
  Switch as HeroSwitch,
  Badge as HeroBadge,
  Avatar as HeroAvatar,
  Chip as HeroChip
} from "@heroui/react";
// import { Button as CustomButton } from "./Button";
// import { TextField as CustomTextField } from "./TextField";
// import { Switch as CustomSwitch } from "./Switch";

export function HeroUIShowcase() {
  return (
    <div className="p-6 space-y-8 bg-nidomi-surface text-nidomi-surface-foreground">
      <div className="text-center">
        <h1 className="text-large font-bold text-nidomi-primary mb-4">
          HeroUI + カスタムデザイントークン統合テンプレート
        </h1>
        <p className="text-medium text-nidomi-surface-variant-foreground">
          HeroUIコンポーネントと既存カスタムコンポーネントの比較デモ
        </p>
      </div>

      {/* HeroUI vs カスタムコンポーネント比較 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* HeroUIコンポーネント */}
        <HeroCard className="p-4">
          <HeroCardBody>
            <h2 className="text-medium font-bold mb-4 text-nidomi-primary">
              HeroUIコンポーネント
            </h2>
            <div className="space-y-4">
              <HeroButton 
                color="primary" 
                size="md"
                className="w-full"
              >
                HeroUI Button
              </HeroButton>
              
              <HeroInput
                label="Email"
                placeholder="Enter your email"
                type="email"
                variant="bordered"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-small">Dark Mode</span>
                <HeroSwitch defaultSelected size="sm" />
              </div>
              
              <div className="flex gap-2">
                <HeroBadge content="99+" color="danger">
                  <HeroAvatar src="https://i.pravatar.cc/150?u=user1" />
                </HeroBadge>
                <HeroChip color="success" variant="flat">
                  Online
                </HeroChip>
              </div>
            </div>
          </HeroCardBody>
        </HeroCard>

        {/* カスタムコンポーネント */}
        <div className="p-4 rounded-12 bg-nidomi-surface-variant border border-nidomi-outline-variant">
          <h2 className="text-medium font-bold mb-4 text-nidomi-primary">
            カスタムコンポーネント
          </h2>
          <div className="space-y-4">
            <HeroButton 
              color="secondary"
              variant="solid"
              size="md"
              className="w-full"
            >
              Custom-styled HeroUI Button
            </HeroButton>
            
            <HeroInput
              label="Email (Custom Style)"
              placeholder="Enter your email"
              type="email"
              variant="faded"
              color="secondary"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-small">Custom Dark Mode</span>
              <HeroSwitch color="secondary" size="sm" />
            </div>
            
            <div className="p-3 rounded-12 bg-nidomi-secondary text-nidomi-secondary-foreground text-small">
              カスタムデザイントークン使用例
            </div>
          </div>
        </div>
      </div>

      {/* デザイントークン展示 */}
      <div className="space-y-4">
        <h2 className="text-medium font-bold text-nidomi-primary">
          カスタムデザイントークン展示
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Primary", class: "bg-nidomi-primary text-nidomi-primary-foreground" },
            { name: "Secondary", class: "bg-nidomi-secondary text-nidomi-secondary-foreground" },
            { name: "Error", class: "bg-nidomi-error text-nidomi-error-foreground" },
            { name: "Surface", class: "bg-nidomi-surface-variant text-nidomi-surface-variant-foreground" },
          ].map((token) => (
            <div
              key={token.name}
              className={`p-4 rounded-12 text-center ${token.class}`}
            >
              <div className="text-small font-bold">{token.name}</div>
              <div className="text-xs mt-1 opacity-80">var(--{token.name.toLowerCase()})</div>
            </div>
          ))}
        </div>
      </div>

      {/* スペーシングトークン */}
      <div className="space-y-4">
        <h2 className="text-medium font-bold text-nidomi-primary">
          スペーシングトークン展示
        </h2>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 8, 12, 16, 20].map((size) => (
            <div
              key={size}
              className={`bg-nidomi-primary text-nidomi-primary-foreground p-${size} text-xs rounded-12`}
            >
              p-{size}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
