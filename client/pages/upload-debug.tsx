import React from 'react';
import Upload from '../components/Upload';

export default function UploadDebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Skify Upload Debug</h1>
        <Upload />
      </div>
    </div>
  );
}