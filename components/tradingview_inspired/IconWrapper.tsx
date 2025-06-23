import React from 'react';

// Helper component for icons with tooltips
const IconWrapper: React.FC<{ icon: React.ElementType, tooltip?: string, className?: string, onClick?: (event: React.MouseEvent<HTMLDivElement>) => void, disabled?: boolean, children?: React.ReactNode }> = 
({ icon: Icon, tooltip, className, onClick, disabled, children }) => (
    <div 
        className={`relative group ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={disabled ? undefined : onClick}
        role={onClick && !disabled ? "button" : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        onKeyDown={onClick && !disabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); } : undefined}
        aria-label={tooltip}
        aria-disabled={disabled}
    >
        {Icon && <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />}
        {children}
        {tooltip && !disabled && (
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-[100]">
                {tooltip}
            </span>
        )}
    </div>
);

export default IconWrapper;