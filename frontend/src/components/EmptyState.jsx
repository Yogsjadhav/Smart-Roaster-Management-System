import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileX, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon size={64} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;
