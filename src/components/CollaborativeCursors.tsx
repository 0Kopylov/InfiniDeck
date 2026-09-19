import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Collaborator, Viewport } from '../types';

interface CollaborativeCursorsProps {
  collaborators: Collaborator[];
  currentUserId: string;
  viewport: Viewport;
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  collaborators,
  currentUserId,
  viewport,
}) => {
  const otherUsers = collaborators.filter((u) => u.id !== currentUserId && u.cursor);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {otherUsers.map((user) => {
          if (!user.cursor) return null;

          // Convert world coordinates to screen coordinates
          const screenX = user.cursor.x * viewport.zoom + viewport.x;
          const screenY = user.cursor.y * viewport.zoom + viewport.y;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: screenX,
                y: screenY,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.5 }}
              className="absolute top-0 left-0 flex flex-col items-start select-none"
            >
              {/* Pointer Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={user.color}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </svg>

              {/* User Name Tag */}
              <div
                className="mt-1 ml-3 px-2 py-0.5 rounded-full text-[11px] font-medium text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{user.name}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
