"use client";

import { SolMember } from "@/data/sol";

interface SolRingProps {
  members: SolMember[];
  poolAmount: number;
  currentRecipientIndex: number;
}

export default function SolRing({ members, poolAmount, currentRecipientIndex }: SolRingProps) {
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const nodeRadius = 24;
  const currentNodeRadius = 32;

  // Calculate positions for 5 nodes arranged in a circle
  // Starting at top (-90 degrees) and going clockwise
  const getNodePosition = (index: number) => {
    const angleInDegrees = -90 + index * 72; // 72 = 360/5
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Get status styling for each node
  const getNodeStyles = (member: SolMember, index: number) => {
    const isCurrent = index === currentRecipientIndex;
    const isCompleted = member.status === "paid";
    const isLate = member.status === "late";
    const isRecipient = member.status === "recipient";

    return {
      isCurrent,
      isCompleted,
      isLate,
      isRecipient,
      fillOpacity: isCompleted || isRecipient ? 1 : 0.3,
      strokeDasharray: isCompleted || isRecipient ? "none" : "4,4",
      nodeSize: isCurrent ? currentNodeRadius : nodeRadius,
    };
  };

  return (
    <svg
      viewBox="0 0 300 300"
      className="w-full max-w-[280px] mx-auto"
      aria-label="Sol group ring visualization"
    >
      {/* Connecting track circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="3"
        strokeDasharray="8,4"
      />

      {/* Connecting lines between adjacent nodes */}
      {members.map((_, index) => {
        const current = getNodePosition(index);
        const next = getNodePosition((index + 1) % members.length);
        return (
          <line
            key={`line-${index}`}
            x1={current.x}
            y1={current.y}
            x2={next.x}
            y2={next.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
          />
        );
      })}

      {/* Center pool amount display */}
      <g className="text-center">
        <circle
          cx={centerX}
          cy={centerY}
          r={42}
          fill="rgba(212,135,42,0.15)"
          stroke="#D4872A"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY - 8}
          textAnchor="middle"
          className="fill-amber text-sm font-display"
          fontSize="14"
        >
          HTG
        </text>
        <text
          x={centerX}
          y={centerY + 14}
          textAnchor="middle"
          className="fill-parchment font-display font-bold"
          fontSize="18"
        >
          {poolAmount.toLocaleString()}
        </text>
      </g>

      {/* Member nodes */}
      {members.map((member, index) => {
        const pos = getNodePosition(index);
        const styles = getNodeStyles(member, index);

        return (
          <g
            key={member.id}
            className={styles.isCurrent ? "sol-current" : ""}
            transform={`translate(${pos.x}, ${pos.y})`}
          >
            {/* Glow effect for current recipient */}
            {styles.isCurrent && (
              <circle
                cx={0}
                cy={0}
                r={styles.nodeSize + 8}
                fill="none"
                stroke="#D4872A"
                strokeWidth="3"
                opacity="0.5"
              />
            )}

            {/* Main node circle */}
            <circle
              cx={0}
              cy={0}
              r={styles.nodeSize}
              fill={member.avatarColor}
              fillOpacity={styles.fillOpacity}
              stroke={styles.isLate ? "#B83232" : styles.isCurrent ? "#D4872A" : member.avatarColor}
              strokeWidth={styles.isCurrent ? 3 : 2}
              strokeDasharray={styles.strokeDasharray}
            />

            {/* Initials */}
            <text
              x={0}
              y={styles.isCurrent ? 2 : 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-parchment font-display font-bold"
              fontSize={styles.isCurrent ? 14 : 12}
            >
              {member.initials}
            </text>

            {/* Status indicators */}
            {styles.isCompleted && (
              <g transform={`translate(${styles.nodeSize - 6}, ${-styles.nodeSize + 6})`}>
                <circle cx={0} cy={0} r={8} fill="#4A7A4A" />
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-parchment"
                  fontSize="10"
                >
                  &#10003;
                </text>
              </g>
            )}

            {styles.isRecipient && (
              <g transform={`translate(${styles.nodeSize - 6}, ${-styles.nodeSize + 6})`}>
                <circle cx={0} cy={0} r={10} fill="#D4872A" />
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-parchment"
                  fontSize="11"
                >
                  &#9733;
                </text>
              </g>
            )}

            {styles.isLate && (
              <g transform={`translate(${styles.nodeSize - 6}, ${-styles.nodeSize + 6})`}>
                <circle cx={0} cy={0} r={8} fill="#B83232" />
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-parchment font-bold"
                  fontSize="10"
                >
                  !
                </text>
              </g>
            )}

            {/* Member name label outside the ring */}
            <text
              x={0}
              y={styles.nodeSize + 14}
              textAnchor="middle"
              className="fill-parchment/80 font-body"
              fontSize="9"
            >
              {member.name.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
