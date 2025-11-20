
import React, { useEffect, useRef, useState } from 'react';

const Landing3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - left - width / 2) / 25;
            const y = (e.clientY - top - height / 2) / 25;
            setRotation({ x: -y, y: x });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-[400px] flex items-center justify-center perspective-1000 group cursor-pointer">
            <div 
                className="relative w-64 h-80 transition-transform duration-100 ease-out transform-style-3d"
                style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
            >
                {/* Terminal Body */}
                <div className="absolute inset-0 bg-slate-800 rounded-xl shadow-2xl transform-style-3d border border-slate-700">
                    {/* Screen */}
                    <div className="absolute top-4 left-4 right-4 h-40 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex flex-col items-center justify-center p-4 relative shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent animate-pulse"></div>
                        <div className="text-cyan-400 font-mono text-3xl font-bold tracking-widest drop-shadow-md z-10">$124.50</div>
                        <div className="text-slate-500 text-xs mt-2 font-semibold z-10">Processing Payment...</div>
                        
                        {/* Screen Glare */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Keypad Area */}
                    <div className="absolute bottom-8 left-4 right-4 grid grid-cols-3 gap-3 transform-style-3d">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="h-6 bg-slate-700 rounded-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95"></div>
                        ))}
                         <div className="h-6 bg-green-600 rounded-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)] col-start-2"></div>
                    </div>

                    {/* 3D Depth Sides */}
                    <div className="absolute inset-y-0 -right-4 w-4 bg-slate-900 origin-left transform rotate-y-90 rounded-r-lg border-r border-slate-800"></div>
                    <div className="absolute inset-x-0 -bottom-4 h-4 bg-slate-900 origin-top transform rotate-x-minus-90 rounded-b-lg border-b border-slate-800"></div>
                    
                    {/* Receipt Slot */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-3 bg-slate-950 rounded-b-lg border-b border-slate-700 shadow-inner z-20"></div>

                    {/* Animated Receipt */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 bg-white shadow-xl rounded-sm origin-top animate-print-receipt flex flex-col items-center p-3 text-[8px] font-mono text-slate-800 opacity-0 z-10">
                        <div className="font-bold text-xs mb-1 tracking-wider uppercase">FlowPay Inc.</div>
                        <div className="text-[6px] text-slate-500 mb-2">{new Date().toLocaleDateString()}</div>
                        <div className="w-full border-b border-dashed border-slate-300 my-1"></div>
                        <div className="w-full flex justify-between"><span>Premium Plan</span><span>$100.00</span></div>
                        <div className="w-full flex justify-between"><span>Setup Fee</span><span>$24.50</span></div>
                         <div className="w-full flex justify-between"><span>VAT (0%)</span><span>$0.00</span></div>
                        <div className="w-full border-b border-dashed border-slate-300 my-1"></div>
                        <div className="w-full flex justify-between font-bold text-[10px]"><span>TOTAL</span><span>$124.50</span></div>
                        <div className="mt-3 text-center text-[6px] uppercase">Auth: 839201 | Term: 01</div>
                        <div className="mt-2 w-full flex justify-center">
                            <div className="h-6 w-20 bg-slate-800"></div> {/* Barcode placeholder */}
                        </div>
                        <div className="w-full h-2 bg-transparent border-b-2 border-slate-100 mt-1 zigzag"></div>
                    </div>
                </div>
                
                {/* Floating Card */}
                 <div className="absolute top-1/2 -right-24 w-40 h-24 bg-gradient-to-br from-cyan-600 via-teal-500 to-emerald-600 rounded-xl shadow-2xl transform-style-3d animate-swipe-card flex flex-col justify-between p-4 border border-white/10 z-30">
                    <div className="flex justify-between items-start">
                         <div className="w-8 h-5 bg-yellow-400/80 rounded-md"></div>
                         <div className="text-white/90 font-bold italic text-xs">VISA</div>
                    </div>
                    <div>
                        <div className="text-white/90 text-[10px] font-mono tracking-widest shadow-sm">**** **** **** 4242</div>
                        <div className="flex justify-between items-end mt-1">
                            <div className="text-white/80 text-[8px] uppercase tracking-wide">FlowPay Business</div>
                            <div className="text-white/80 text-[6px]">12/28</div>
                        </div>
                    </div>
                    {/* Card Depth */}
                    <div className="absolute inset-y-0 -right-1 w-1 bg-teal-800 origin-left transform rotate-y-90 rounded-r-sm"></div>
                 </div>
            </div>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .rotate-y-90 { transform: rotateY(90deg); }
                .rotate-x-minus-90 { transform: rotateX(-90deg); }
                
                @keyframes print-receipt {
                    0% { height: 0; opacity: 0; transform: translateX(-50%) translateY(0) rotateX(0); }
                    10% { opacity: 1; }
                    30% { height: 160px; transform: translateX(-50%) translateY(-100px) rotateX(10deg); }
                    80% { height: 160px; opacity: 1; transform: translateX(-50%) translateY(-120px) rotateX(20deg); }
                    90% { opacity: 0; }
                    100% { height: 0; opacity: 0; transform: translateX(-50%) translateY(0); }
                }
                .animate-print-receipt {
                    animation: print-receipt 5s infinite ease-in-out;
                }
                
                @keyframes swipe-card {
                    0% { transform: translateZ(80px) translateX(0) translateY(0) rotateY(-15deg) rotateZ(5deg); }
                    30% { transform: translateZ(60px) translateX(-90px) translateY(20px) rotateY(5deg) rotateZ(-5deg); }
                    60% { transform: translateZ(80px) translateX(0) translateY(0) rotateY(-15deg) rotateZ(5deg); }
                    100% { transform: translateZ(80px) translateX(0) translateY(0) rotateY(-15deg) rotateZ(5deg); }
                }
                .animate-swipe-card {
                    animation: swipe-card 5s infinite ease-in-out;
                }

                .zigzag {
                    background: linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%),
                                linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%);
                    background-size: 6px 12px;
                }
            `}</style>
        </div>
    );
};

export default Landing3D;
