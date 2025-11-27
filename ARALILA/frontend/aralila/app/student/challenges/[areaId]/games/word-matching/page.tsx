"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import Phaser to avoid SSR issues
const PhaserGame = dynamic(() => Promise.resolve(PhaserGameComponent), {
  ssr: false,
});

function PhaserGameComponent() {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // Import Phaser dynamically
    import("phaser").then((Phaser) => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1200,
        height: 800,
        parent: gameRef.current!,
        transparent: true,
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
      };

      gameInstanceRef.current = new Phaser.Game(config);

      function preload(this: Phaser.Scene) {
        // Assets will be loaded here
      }

      function create(this: Phaser.Scene) {
        // Create gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x16213e, 1);
        bg.fillRect(0, 0, 1200, 800);

        // Add decorative elements (stars/particles)
        for (let i = 0; i < 50; i++) {
          const star = this.add.circle(
            Math.random() * 1200,
            Math.random() * 800,
            Math.random() * 2 + 1,
            0xffffff,
            Math.random() * 0.5 + 0.3
          );
          this.tweens.add({
            targets: star,
            alpha: { from: 0.3, to: 0.8 },
            duration: Math.random() * 2000 + 1000,
            yoyo: true,
            repeat: -1,
          });
        }

        // Title with glow
        const title = this.add
          .text(600, 60, "Your Learning Journey", {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial",
          })
          .setOrigin(0.5);

        // Title shadow
        const titleShadow = this.add
          .text(602, 62, "Your Learning Journey", {
            fontSize: "48px",
            color: "#4a90e2",
            fontStyle: "bold",
            fontFamily: "Arial",
          })
          .setOrigin(0.5)
          .setDepth(-1)
          .setAlpha(0.5);

        // Define area positions with better spacing
        const areas = [
          {
            x: 200,
            y: 650,
            color: 0x4a90e2,
            glowColor: 0x2196f3,
            name: "Playground",
            icon: "🏀",
            id: 1,
            unlocked: true,
          },
          {
            x: 380,
            y: 520,
            color: 0x9b59b6,
            glowColor: 0xab47bc,
            name: "Classroom",
            icon: "📚",
            id: 2,
            unlocked: true,
          },
          {
            x: 600,
            y: 420,
            color: 0xe74c3c,
            glowColor: 0xef5350,
            name: "Dinner Table",
            icon: "🍽️",
            id: 3,
            unlocked: false,
          },
          {
            x: 820,
            y: 320,
            color: 0xf39c12,
            glowColor: 0xffa726,
            name: "Town Market",
            icon: "🏪",
            id: 4,
            unlocked: false,
          },
          {
            x: 1000,
            y: 180,
            color: 0x27ae60,
            glowColor: 0x66bb6a,
            name: "Mountain",
            icon: "⛰️",
            id: 5,
            unlocked: false,
          },
        ];

        // Draw dramatic swirling curved paths
        for (let i = 0; i < areas.length - 1; i++) {
          const start = areas[i];
          const end = areas[i + 1];

          const deltaX = end.x - start.x;
          const deltaY = end.y - start.y;

          // Create MORE dramatic control points for exaggerated swirls
          // First control point swirls out far to one side
          const control1X =
            start.x + deltaX * 0.25 + (i % 2 === 0 ? 200 : -200);
          const control1Y = start.y + deltaY * 0.2;

          // Second control point swirls to the opposite side
          const control2X =
            start.x + deltaX * 0.75 + (i % 2 === 0 ? -200 : 200);
          const control2Y = start.y + deltaY * 0.8;

          // Use CubicBezier for smooth S-curves
          const curve = new Phaser.Curves.CubicBezier(
            new Phaser.Math.Vector2(start.x, start.y),
            new Phaser.Math.Vector2(control1X, control1Y),
            new Phaser.Math.Vector2(control2X, control2Y),
            new Phaser.Math.Vector2(end.x, end.y)
          );

          // Draw glow layers for unlocked paths
          if (start.unlocked && end.unlocked) {
            // Outer glow
            const glow1 = this.add.graphics();
            glow1.lineStyle(20, 0x4a90e2, 0.15);
            curve.draw(glow1, 256);

            // Middle glow
            const glow2 = this.add.graphics();
            glow2.lineStyle(14, 0x64b5f6, 0.3);
            curve.draw(glow2, 256);

            // Inner line
            const glow3 = this.add.graphics();
            glow3.lineStyle(10, 0x90caf9, 0.6);
            curve.draw(glow3, 256);

            // Bright core
            const glow4 = this.add.graphics();
            glow4.lineStyle(6, 0xffffff, 0.8);
            curve.draw(glow4, 256);
          } else {
            // Locked path - subtle gray
            const lockedPath = this.add.graphics();
            lockedPath.lineStyle(6, 0x555555, 0.3);
            curve.draw(lockedPath, 256);
          }

          // Draw animated dots along path (dotted line effect)
          const points = curve.getPoints(100); // More points for longer curve
          points.forEach((point, index) => {
            if (index % 4 === 0) {
              // Closer spacing
              const dot = this.add.circle(
                point.x,
                point.y,
                start.unlocked ? 6 : 3,
                start.unlocked ? 0xffffff : 0x666666,
                start.unlocked ? 1 : 0.3
              );

              if (start.unlocked) {
                // Animated flowing dots with wave effect
                this.tweens.add({
                  targets: dot,
                  alpha: { from: 0.3, to: 1 },
                  scale: { from: 0.7, to: 1.4 },
                  duration: 1500,
                  delay: index * 20, // Faster wave
                  yoyo: true,
                  repeat: -1,
                  ease: "Sine.easeInOut",
                });
              }
            }
          });

          // Add MORE sparkle particles along the path
          if (start.unlocked && end.unlocked) {
            const sparklePoints = curve.getPoints(40);
            sparklePoints.forEach((point, index) => {
              const sparkle = this.add.circle(
                point.x,
                point.y,
                Math.random() * 2 + 1,
                0xffffff,
                0.8
              );

              this.tweens.add({
                targets: sparkle,
                alpha: { from: 0.1, to: 1 },
                scale: { from: 0.3, to: 2 },
                duration: Math.random() * 2000 + 1000,
                delay: index * 80,
                yoyo: true,
                repeat: -1,
                ease: "Cubic.easeInOut",
              });
            });
          }
        }

        // Create area nodes
        areas.forEach((area, index) => {
          // Progress indicator (example: 4/6 games)
          const progress = area.unlocked ? (index === 0 ? 6 : 4) : 0;
          const totalGames = 6;
          const progressPercent = progress / totalGames;

          // Outer ring (background)
          const outerRing = this.add.circle(area.x, area.y, 65, 0x1a1a2e, 1);
          outerRing.setStrokeStyle(4, 0x2d2d44, 1);

          // Progress ring
          if (area.unlocked) {
            const progressGraphics = this.add.graphics();
            progressGraphics.lineStyle(8, area.glowColor, 1);
            progressGraphics.beginPath();
            progressGraphics.arc(
              area.x,
              area.y,
              60,
              Phaser.Math.DegToRad(-90),
              Phaser.Math.DegToRad(-90 + 360 * progressPercent),
              false
            );
            progressGraphics.strokePath();
          }

          // Glow effect for unlocked areas
          if (area.unlocked) {
            const glow = this.add.circle(
              area.x,
              area.y,
              75,
              area.glowColor,
              0.2
            );
            this.tweens.add({
              targets: glow,
              scale: { from: 1, to: 1.5 },
              alpha: { from: 0.2, to: 0 },
              duration: 2000,
              repeat: -1,
              ease: "Sine.easeOut",
            });
          }

          // Main circle
          const circle = this.add.circle(area.x, area.y, 50, area.color, 1);
          if (area.unlocked) {
            circle.setInteractive({ useHandCursor: true });
          }

          // Inner shadow
          this.add.circle(area.x, area.y + 2, 48, 0x000000, 0.3);

          // Icon or lock
          const iconText = this.add
            .text(area.x, area.y - 5, area.unlocked ? area.icon : "🔒", {
              fontSize: area.unlocked ? "40px" : "36px",
            })
            .setOrigin(0.5);

          // Hover effects for unlocked areas
          if (area.unlocked) {
            circle.on("pointerover", () => {
              this.tweens.add({
                targets: [circle, iconText],
                scale: 1.15,
                duration: 200,
                ease: "Back.easeOut",
              });

              // Enhanced sparkle burst effect
              for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const distance = 70 + Math.random() * 20;
                const sparkle = this.add.circle(
                  area.x + Math.cos(angle) * distance,
                  area.y + Math.sin(angle) * distance,
                  4,
                  0xffffff,
                  1
                );
                this.tweens.add({
                  targets: sparkle,
                  alpha: 0,
                  scale: 0,
                  x: sparkle.x + Math.cos(angle) * 30,
                  y: sparkle.y + Math.sin(angle) * 30,
                  duration: 600,
                  ease: "Cubic.easeOut",
                  onComplete: () => sparkle.destroy(),
                });
              }
            });

            circle.on("pointerout", () => {
              this.tweens.add({
                targets: [circle, iconText],
                scale: 1,
                duration: 200,
              });
            });

            circle.on("pointerdown", () => {
              // Click animation
              this.tweens.add({
                targets: circle,
                scale: 0.9,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                  console.log(`Navigate to ${area.name}`);
                  // window.location.href = `/student/area/${area.id}`;
                },
              });
            });
          }

          // Area label with background
          const labelBg = this.add.graphics();
          labelBg.fillStyle(0x000000, 0.7);
          labelBg.fillRoundedRect(area.x - 80, area.y + 75, 160, 40, 10);

          const label = this.add
            .text(area.x, area.y + 95, area.name, {
              fontSize: "18px",
              color: "#ffffff",
              fontFamily: "Arial",
              fontStyle: "bold",
            })
            .setOrigin(0.5);

          // Progress text
          if (area.unlocked && progress > 0) {
            const progressText = this.add
              .text(
                area.x,
                area.y + 115,
                `${progress}/${totalGames} completed`,
                {
                  fontSize: "12px",
                  color: "#90caf9",
                  fontFamily: "Arial",
                }
              )
              .setOrigin(0.5);
          }

          // Lock message
          if (!area.unlocked) {
            const lockMsg = this.add
              .text(area.x, area.y + 115, "Complete previous area", {
                fontSize: "11px",
                color: "#999999",
                fontFamily: "Arial",
              })
              .setOrigin(0.5);
          }
        });
      }

      function update(this: Phaser.Scene) {
        // Animation loop
      }
    });

    // Cleanup on unmount
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div
        ref={gameRef}
        className="rounded-2xl shadow-2xl border border-white/10"
      />
    </div>
  );
}

export default function PhaserAreaMap() {
  return <PhaserGame />;
}
