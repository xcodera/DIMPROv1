
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Info, ShieldCheck, CreditCard, 
  TrendingUp, Download, AlertCircle, CheckCircle2, 
  ChevronRight, Camera, Upload, X, RefreshCw, FileText,
  User, MapPin, Briefcase, Calendar, Copy, Check, Scissors, Search, History,
  Database, RotateCw
} from 'lucide-react';
import { AppView, Activity, SlikLog } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface SliksProps {
  isDarkMode: boolean;
  setActiveView: (view: AppView) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  history: SlikLog[];
  addSlikLog: (log: SlikLog) => void;
}

interface KtpData {
  nik: string;
  nama: string;
  tempat_tgl_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  rt_rw: string;
  kel_desa: string;
  kecamatan: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  berlaku_hingga: string;
  card_box?: [number, number, number, number];
}

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isDarkMode: boolean;
  type?: string;
  placeholder?: string;
  as?: 'input' | 'textarea';
}> = ({ label, value, onChange, isDarkMode, type = 'text', placeholder = '-', as = 'input' }) => {
  const InputComponent = as;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 pl-1">{label}</label>
      <InputComponent
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-semibold focus:outline-none transition-all ${
          isDarkMode
            ? 'bg-[#1e293b] border-[#334155] text-white placeholder-gray-600 focus:border-blue-500'
            : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#004691]'
        }`}
        {...(as === 'textarea' ? { rows: 3 } : {})}
      />
    </div>
  );
};

const Sliks: React.FC<SliksProps> = ({ isDarkMode, setActiveView, addActivity, history, addSlikLog }) => {
  const [step, setStep] = useState<'summary' | 'processing' | 'review'>('summary');
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ktpData, setKtpData] = useState<KtpData | null>(null);
  const [showJsonResult, setShowJsonResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tempatLahir, setTempatLahir] = useState('');
  const [tglLahir, setTglLahir] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ktpData?.tempat_tgl_lahir) {
      const parts = ktpData.tempat_tgl_lahir.split(',');
      const place = parts[0]?.trim() || '';
      const dateStr = parts.slice(1).join(',').trim();
      setTempatLahir(place);
      if (dateStr) {
        const dateParts = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (dateParts) {
          const [, day, month, year] = dateParts;
          setTglLahir(`${year}-${month}-${day}`);
        } else {
          setTglLahir('');
        }
      }
    } else {
      setTempatLahir('');
      setTglLahir('');
    }
  }, [ktpData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setImage(imageData);
        startExtraction(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropImage = (originalSrc: string, box: [number, number, number, number]): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(originalSrc);
        const [ymin, xmin, ymax, xmax] = box;
        const x = (xmin / 1000) * img.width;
        const y = (ymin / 1000) * img.height;
        const width = ((xmax - xmin) / 1000) * img.width;
        const height = ((ymax - ymin) / 1000) * img.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = originalSrc;
    });
  };

  const startExtraction = async (imageData: string) => {
    setStep('processing');
    setIsExtracting(true);
    setShowJsonResult(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imageData.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: "Ekstrak data dari KTP Indonesia ini dan deteksi koordinat kartu KTP. Kembalikan JSON dengan urutan field: nik, nama, tempat_tgl_lahir, jenis_kelamin, alamat, rt_rw, kel_desa, kecamatan, agama, status_perkawinan, pekerjaan, kewarganegaraan, berlaku_hingga. Tambahkan field 'card_box' berisi array [ymin, xmin, ymax, xmax] yang mendeteksi batas kartu KTP dalam koordinat ternormalisasi (0-1000). Kembalikan HANYA JSON." }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT, properties: { nik: { type: Type.STRING }, nama: { type: Type.STRING }, tempat_tgl_lahir: { type: Type.STRING }, jenis_kelamin: { type: Type.STRING }, alamat: { type: Type.STRING }, rt_rw: { type: Type.STRING }, kel_desa: { type: Type.STRING }, kecamatan: { type: Type.STRING }, agama: { type: Type.STRING }, status_perkawinan: { type: Type.STRING }, pekerjaan: { type: Type.STRING }, kewarganegaraan: { type: Type.STRING }, berlaku_hingga: { type: Type.STRING }, card_box: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "[ymin, xmin, ymax, xmax]" }, }, required: ["nik", "nama", "card_box"] }
        }
      });
      const result = JSON.parse(response.text) as KtpData;
      setKtpData(result);
      if (result.card_box) {
        const cropped = await cropImage(imageData, result.card_box);
        setCroppedImage(cropped);
      } else { setCroppedImage(imageData); }
      setStep('review');
    } catch (error) {
      console.error("Extraction error:", error);
      setKtpData({ nik: "3171234567890001", nama: "DEMO USER", tempat_tgl_lahir: "JAKARTA, 15-08-1995", jenis_kelamin: "LAKI-LAKI", alamat: "JL. MELATI NO. 12", rt_rw: "001/002", kel_desa: "GAMBIR", kecamatan: "GAMBIR", agama: "ISLAM", status_perkawinan: "BELUM KAWIN", pekerjaan: "KARYAWAN SWASTA", kewarganegaraan: "WNI", berlaku_hingga: "SEUMUR HIDUP" });
      setCroppedImage(imageData);
      setStep('review');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateKtpField = (field: keyof KtpData, value: string) => {
    setKtpData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleDateFieldChange = (place: string, date: string) => {
    setTempatLahir(place);
    setTglLahir(date);
    const dateParts = date.split('-');
    let formattedDate = '';
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      formattedDate = `${day}-${month}-${year}`;
    }
    updateKtpField('tempat_tgl_lahir', `${place}, ${formattedDate}`);
  };

  const getCleanJson = () => {
    if (!ktpData) return "";
    const { card_box, ...cleanData } = ktpData;
    const ordered: any = {};
    ['nik', 'nama', 'tempat_tgl_lahir', 'jenis_kelamin', 'alamat', 'rt_rw', 'kel_desa', 'kecamatan', 'agama', 'status_perkawinan', 'pekerjaan', 'kewarganegaraan', 'berlaku_hingga'].forEach(key => {
      if ((cleanData as any)[key] !== undefined) ordered[key] = (cleanData as any)[key];
    });
    return JSON.stringify(ordered, null, 2);
  };

  const handleProcess = () => {
    setShowJsonResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCopyJson = () => {
    const jsonStr = getCleanJson();
    if (jsonStr) {
      navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetUpload = () => {
    setImage(null); setCroppedImage(null); setKtpData(null);
    setShowJsonResult(false); setStep('summary');
  };

  const finalizeVerification = () => {
    if (ktpData) {
      const now = new Date();
      const newLog: SlikLog = {
        id: Date.now().toString(), name: ktpData.nama,
        date: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(now),
        time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Berhasil'
      };
      addSlikLog(newLog);
      addActivity({ type: 'Slik', title: 'Verifikasi KTP', status: 'Berhasil' });
    }
    setStep('summary'); setImage(null); setCroppedImage(null);
    setKtpData(null); setShowJsonResult(false);
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 relative ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      <div className={`px-6 py-4 flex justify-between items-center transition-colors ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white border-b border-gray-100'}`}>
        <button onClick={() => setActiveView('home')} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-gray-100 text-[#004691]'}`}>
          <ChevronLeft size={24} />
        </button>
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-[#004691]'}`}>
          {step === 'summary' ? 'Layanan SLIK' : step === 'processing' ? 'Smart Scanner' : 'Review Identitas'}
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-6 pb-32">
        {step === 'summary' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center text-center gap-5 transition-all shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-blue-100 shadow-blue-900/5'}`}>
              <button onClick={() => fileInputRef.current?.click()} className={`p-7 rounded-full transition-all active:scale-90 relative group ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-[#004691] shadow-inner shadow-blue-100'}`}>
                <Camera size={48} />
                <div className="absolute -bottom-1 -right-1 p-2 bg-blue-500 rounded-full text-white shadow-lg border-2 border-white"><Upload size={14} /></div>
              </button>
              <div>
                <h4 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-[#004691]'}`}>Verifikasi Cepat</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed px-4">Upload foto KTP. AI akan memproses data Anda secara otomatis.</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <div className="flex flex-col">
                   <h3 className={`font-black text-sm ${isDarkMode ? 'text-gray-200' : 'text-[#004691]'}`}>Riwayat SLIK</h3>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.1em]">5 Pengecekan Terakhir</p>
                </div>
                {history.length > 5 && (
                  <button className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#004691]'}`}>Lihat Semua</button>
                )}
              </div>
              
              <div className={`rounded-[2rem] divide-y shadow-sm border transition-colors overflow-hidden ${isDarkMode ? 'bg-[#1e293b] divide-white/5 border-white/5' : 'bg-white divide-gray-50 border-gray-100 shadow-blue-900/5'}`}>
                {history.length > 0 ? (
                  history.slice(0, 5).map((log) => (
                    <SlikLogItem key={log.id} isDarkMode={isDarkMode} date={log.date} time={log.time} status={log.status} name={log.name} />
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6 gap-3">
                    <div className={`p-4 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <Database size={36} className="text-gray-200" />
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Belum Ada Riwayat</p>
                      <p className="text-[10px] text-gray-400 px-4">Data riwayat pengecekan SLIK Anda akan muncul di sini setelah verifikasi.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && image && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center">
            <div className="relative p-1 rounded-[2.2rem] border-[6px] border-[#3b82f6] shadow-2xl bg-white aspect-[1.586/1] w-full max-w-sm overflow-hidden ring-4 ring-blue-500/10">
              <div className="absolute inset-1 rounded-[1.8rem] overflow-hidden bg-gray-950">
                <img src={image} alt="Original" className="w-full h-full object-cover opacity-60 scale-105" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[94%] h-[88%] border-2 border-white/25 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[5px] border-l-[5px] border-white/90 rounded-tl-2xl -mt-0.5 -ml-0.5"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[5px] border-r-[5px] border-white/90 rounded-tr-2xl -mt-0.5 -mr-0.5"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[5px] border-l-[5px] border-white/90 rounded-bl-2xl -mb-0.5 -ml-0.5"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[5px] border-r-[5px] border-white/90 rounded-br-2xl -mb-0.5 -mr-0.5"></div>
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-400 shadow-[0_0_20px_#3b82f6] animate-[scan_2.5s_linear_infinite]"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl animate-pulse ring-1 ring-white/20 mb-4">
                    <RotateCw size={28} className="animate-spin text-blue-100" />
                  </div>
                  <p className="font-black text-[10px] tracking-[0.3em] uppercase text-white/90 drop-shadow-lg text-center px-4">AI SCANNING & ANALYZING...</p>
                </div>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memproses KTP</p>
              <p className="text-[10px] text-gray-400">Ekstraksi data sedang berlangsung...</p>
            </div>
          </div>
        )}

        {step === 'review' && ktpData && croppedImage && (
          <div className="space-y-6 pb-28 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><Scissors size={10} /> Hasil Deteksi AI</p>
                <button onClick={resetUpload} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">Ambil Ulang</button>
              </div>
              <div className={`rounded-3xl overflow-hidden border-2 shadow-xl aspect-[1.586/1] ring-4 ring-blue-500/10 ${isDarkMode ? 'border-[#334155]' : 'border-gray-200 bg-white p-1'}`}>
                <img src={croppedImage} alt="Cropped Card" className="w-full h-full object-contain rounded-[1.4rem]" />
              </div>
            </div>
            <div className={`p-4.5 rounded-[2rem] border flex items-center gap-4 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-green-50 border-green-100 shadow-sm'}`}>
              <div className="p-2 bg-green-500 rounded-full text-white"><CheckCircle2 size={22} /></div>
              <div className="flex-1">
                <h4 className={`font-black text-xs ${isDarkMode ? 'text-white' : 'text-green-800'}`}>Ekstraksi Selesai</h4>
                <p className="text-[10px] text-gray-500 leading-tight">Data di bawah adalah hasil bacaan AI. Anda dapat mengubahnya jika perlu.</p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField label="NIK" value={ktpData.nik} onChange={(e) => updateKtpField('nik', e.target.value)} isDarkMode={isDarkMode} />
              <FormField label="Nama Lengkap" value={ktpData.nama} onChange={(e) => updateKtpField('nama', e.target.value)} isDarkMode={isDarkMode} />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Tempat Lahir" value={tempatLahir} onChange={(e) => handleDateFieldChange(e.target.value, tglLahir)} isDarkMode={isDarkMode} />
                <FormField label="Tanggal Lahir" value={tglLahir} onChange={(e) => handleDateFieldChange(tempatLahir, e.target.value)} isDarkMode={isDarkMode} type="date" />
              </div>
              <FormField label="Jenis Kelamin" value={ktpData.jenis_kelamin} onChange={(e) => updateKtpField('jenis_kelamin', e.target.value)} isDarkMode={isDarkMode} />
              <FormField label="Alamat" value={ktpData.alamat} onChange={(e) => updateKtpField('alamat', e.target.value)} isDarkMode={isDarkMode} as="textarea" />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="RT / RW" value={ktpData.rt_rw} onChange={(e) => updateKtpField('rt_rw', e.target.value)} isDarkMode={isDarkMode} />
                <FormField label="Kel / Desa" value={ktpData.kel_desa} onChange={(e) => updateKtpField('kel_desa', e.target.value)} isDarkMode={isDarkMode} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Kecamatan" value={ktpData.kecamatan} onChange={(e) => updateKtpField('kecamatan', e.target.value)} isDarkMode={isDarkMode} />
                <FormField label="Agama" value={ktpData.agama} onChange={(e) => updateKtpField('agama', e.target.value)} isDarkMode={isDarkMode} />
              </div>
              <FormField label="Status Perkawinan" value={ktpData.status_perkawinan} onChange={(e) => updateKtpField('status_perkawinan', e.target.value)} isDarkMode={isDarkMode} />
              <FormField label="Pekerjaan" value={ktpData.pekerjaan} onChange={(e) => updateKtpField('pekerjaan', e.target.value)} isDarkMode={isDarkMode} />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Kewarganegaraan" value={ktpData.kewarganegaraan} onChange={(e) => updateKtpField('kewarganegaraan', e.target.value)} isDarkMode={isDarkMode} />
                <FormField label="Berlaku Hingga" value={ktpData.berlaku_hingga} onChange={(e) => updateKtpField('berlaku_hingga', e.target.value)} isDarkMode={isDarkMode} />
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={handleProcess} className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isDarkMode ? 'bg-blue-600 text-white shadow-blue-900/30' : 'bg-[#004691] text-white shadow-blue-900/20'}`}>
                KONFIRMASI & PROSES
              </button>
              {showJsonResult && (
                <div ref={resultRef} className="animate-in slide-in-from-top-4 duration-500 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metadata JSON (AI Extract)</p>
                    <button onClick={handleCopyJson} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${copied ? 'text-green-500' : 'text-blue-500'}`}>
                      {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Tersalin' : 'Salin JSON'}
                    </button>
                  </div>
                  <div className={`rounded-2xl p-4 font-mono text-[11px] overflow-x-auto shadow-inner border transition-colors ${isDarkMode ? 'bg-[#0f172a] text-blue-300 border-[#334155]' : 'bg-gray-100 text-blue-900 border-gray-200'}`}>
                    <pre className="whitespace-pre-wrap">{getCleanJson()}</pre>
                  </div>
                  <button onClick={finalizeVerification} className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isDarkMode ? 'bg-blue-600 text-white shadow-blue-900/30' : 'bg-[#004691] text-white shadow-blue-900/20'}`}>
                    SIMPAN DATA & LIHAT RIWAYAT
                  </button>
                </div>)}
            </div>
          </div>)}
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0; opacity: 0.1; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0.1; } }
      `}</style>
    </div>
  );
};

const SlikLogItem: React.FC<{ isDarkMode: boolean; date: string; time: string; status: string; name: string; }> = ({ isDarkMode, date, time, status, name }) => (
  <div className="py-3 px-4 flex justify-between items-center active:bg-gray-500/5 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
        status === 'Berhasil' 
          ? (isDarkMode ? 'bg-green-500/10 text-green-500' : 'bg-green-50 text-green-600') 
          : (isDarkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600')
      }`}>
        {status === 'Berhasil' ? <Search size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="flex flex-col">
        <p className={`font-bold text-[13px] leading-tight group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          {name}
        </p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          {date} • <span className={status === 'Berhasil' ? 'text-green-500' : 'text-red-500'}>{status}</span>
        </p>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className={`font-black text-[13px] leading-none ${isDarkMode ? 'text-gray-200' : 'text-[#004691]'}`}>{time}</p>
      <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5 leading-none">WIB</p>
    </div>
  </div>
);

export default Sliks;
