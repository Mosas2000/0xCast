import React, { useState, useRef } from 'react';

export const AvatarUpload: React.FC = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center text-3xl group-hover:border-primary-500 transition-all">
                        {preview ? (
                            <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                            '👤'
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Profile Picture</h4>
                    <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 5MB.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase"
                    >
                        Change Avatar
                    </button>
                </div>
            </div>
        </div>
    );
};
