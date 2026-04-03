import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText, Upload, Download, Eye, Trash2, Edit3,
  CheckCircle2, Clock, AlertCircle, PenTool, X,
  File, FileImage, ChevronRight, Plus, Search,
  RotateCcw, Save, Type
} from 'lucide-react';

type DocStatus = 'draft' | 'in_review' | 'signed';

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocStatus;
  signatory: string;
  signedAt?: string;
  fileUrl?: string;
  thumbnail?: string;
}

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: <FileText size={12} />
  },
  in_review: {
    label: 'In Review',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock size={12} />
  },
  signed: {
    label: 'Signed',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <CheckCircle2 size={12} />
  }
};

const STATUS_FLOW: DocStatus[] = ['draft', 'in_review', 'signed'];

const DocumentsPage: React.FC = () => {
  // State
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-001',
      title: 'Investment Term Sheet - Series A',
      type: 'PDF',
      size: '2.4 MB',
      uploadedAt: '2025-01-15',
      uploadedBy: 'John Doe',
      status: 'signed',
      signatory: 'Mike Johnson',
      signedAt: '2025-01-18'
    },
    {
      id: 'doc-002',
      title: 'NDA - Confidentiality Agreement',
      type: 'PDF',
      size: '1.1 MB',
      uploadedAt: '2025-01-20',
      uploadedBy: 'Sarah Smith',
      status: 'in_review',
      signatory: 'Emily Davis'
    },
    {
      id: 'doc-003',
      title: 'Shareholder Agreement',
      type: 'DOCX',
      size: '3.8 MB',
      uploadedAt: '2025-01-22',
      uploadedBy: 'Alex Turner',
      status: 'draft',
      signatory: 'Lisa Chen'
    },
    {
      id: 'doc-004',
      title: 'Revenue Projection Report Q4',
      type: 'XLSX',
      size: '856 KB',
      uploadedAt: '2025-01-25',
      uploadedBy: 'Tom Wilson',
      status: 'draft',
      signatory: 'Rachel Kim'
    },
    {
      id: 'doc-005',
      title: 'Partnership MOU',
      type: 'PDF',
      size: '1.5 MB',
      uploadedAt: '2025-01-28',
      uploadedBy: 'John Doe',
      status: 'signed',
      signatory: 'Sarah Smith',
      signedAt: '2025-01-30'
    },
    {
      id: 'doc-006',
      title: 'Board Resolution - Fund Allocation',
      type: 'PDF',
      size: '920 KB',
      uploadedAt: '2025-02-01',
      uploadedBy: 'Mike Johnson',
      status: 'in_review',
      signatory: 'Alex Turner'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocStatus>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'in_review' | 'signed'>('all');

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSignatory, setUploadSignatory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Signature Modal
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureDoc, setSignatureDoc] = useState<Document | null>(null);
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureFont, setSignatureFont] = useState('cursive');
  const [hasSigned, setHasSigned] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.signatory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabCounts = {
    all: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    in_review: documents.filter(d => d.status === 'in_review').length,
    signed: documents.filter(d => d.status === 'signed').length
  };

  // ===== CANVAS SIGNATURE =====
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasSigned(false);
  }, []);

  useEffect(() => {
    if (isSignatureModalOpen && signatureType === 'draw') {
      initCanvas();
    }
  }, [isSignatureModalOpen, signatureType, initCanvas]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (signatureType !== 'draw') return;
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || signatureType !== 'draw') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSigned(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    initCanvas();
    setTypedSignature('');
    setHasSigned(false);
  };

  // ===== FILE HANDLING =====
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
      if (!uploadTitle) {
        setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      if (!uploadTitle) {
        setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  const getFileIcon = (type: string) => {
    if (type === 'PDF') return <FileText size={20} className="text-red-500" />;
    if (type === 'DOCX' || type === 'DOC') return <File size={20} className="text-blue-500" />;
    if (type === 'XLSX' || type === 'XLS') return <FileImage size={20} className="text-green-500" />;
    return <File size={20} className="text-gray-400" />;
  };

  // ===== UPLOAD =====
  const handleUpload = () => {
    if (!uploadedFile || !uploadTitle.trim() || !uploadSignatory.trim()) return;
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: Document = {
        id: 'doc-' + Math.random().toString(36).substr(2, 6),
        title: uploadTitle.trim(),
        type: getFileType(uploadedFile.name),
        size: formatFileSize(uploadedFile.size),
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'You',
        status: 'draft',
        signatory: uploadSignatory.trim()
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUploadedFile(null);
      setUploadTitle('');
      setUploadSignatory('');
    }, 1500);
  };

  // ===== STATUS CHANGE =====
  const handleStatusChange = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      const currentIndex = STATUS_FLOW.indexOf(doc.status);
      const nextIndex = (currentIndex + 1) % STATUS_FLOW.length;
      const newStatus = STATUS_FLOW[nextIndex];
      const update: Partial<Document> = { status: newStatus };
      if (newStatus === 'signed') {
        update.signedAt = new Date().toISOString().split('T')[0];
      } else {
        update.signedAt = undefined;
      }
      return { ...doc, ...update };
    }));
  };

  // ===== SIGN DOCUMENT =====
  const handleOpenSignature = (doc: Document) => {
    setSignatureDoc(doc);
    setSignatureType('draw');
    setTypedSignature('');
    setHasSigned(false);
    setIsSignatureModalOpen(true);
  };

  const handleConfirmSignature = () => {
    if (!signatureDoc || !hasSigned) return;
    setDocuments(prev => prev.map(doc =>
      doc.id === signatureDoc.id
        ? { ...doc, status: 'signed' as DocStatus, signedAt: new Date().toISOString().split('T')[0] }
        : doc
    ));
    setIsSignatureModalOpen(false);
    setSignatureDoc(null);
    setHasSigned(false);
  };

  // ===== DELETE =====
  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // ===== PREVIEW =====
  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  const SIGNATURE_FONTS = [
    { name: 'cursive', label: 'Cursive' },
    { name: 'serif', label: 'Serif' },
    { name: 'monospace', label: 'Monospace' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-3 sm:mb-4">Document Chamber</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {(['all', 'draft', 'in_review', 'signed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-violet-600 text-white shadow-md scale-[1.03]'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {tab === 'all' ? `${tabCounts.all} All` : tab === 'draft' ? `${tabCounts.draft} Draft` : tab === 'in_review' ? `${tabCounts.in_review} In Review` : `${tabCounts.signed} Signed`}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm shadow-lg shadow-violet-200/60 transition-all w-full sm:w-auto justify-center shrink-0"
          >
            <Upload size={17} /> Upload Document
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, uploader, or signatory..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header - Desktop */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Document</div>
          <div className="col-span-2">Uploaded</div>
          <div className="col-span-2">Signatory</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Documents */}
        <div className="divide-y divide-gray-50">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-200" />
              </div>
              <p className="text-sm font-medium text-gray-400">No documents found</p>
              <p className="text-xs text-gray-300 mt-1">Try changing your search or filter</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const statusConf = STATUS_CONFIG[doc.status];
              return (
                <div key={doc.id} className="group hover:bg-gray-50/50 transition-colors">
                  {/* Desktop Row */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{doc.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{doc.type} · {doc.size}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">{doc.uploadedAt}</p>
                      <p className="text-[11px] text-gray-400">{doc.uploadedBy}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-gray-700">{doc.signatory}</p>
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => handleStatusChange(doc.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer hover:shadow-sm ${statusConf.bg} ${statusConf.border} ${statusConf.color}`}
                        title="Click to change status"
                      >
                        {statusConf.icon}
                        {statusConf.label}
                        <ChevronRight size={10} className="opacity-50" />
                      </button>
                      {doc.signedAt && (
                        <p className="text-[10px] text-gray-400 mt-1">Signed {doc.signedAt}</p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePreview(doc)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-violet-50 flex items-center justify-center transition" title="Preview">
                        <Eye size={14} className="text-gray-400 hover:text-violet-600" />
                      </button>
                      {doc.status !== 'signed' && (
                        <button onClick={() => handleOpenSignature(doc)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition" title="Sign">
                          <PenTool size={14} className="text-gray-400 hover:text-green-600" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center transition" title="Delete">
                        <Trash2 size={14} className="text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div className="sm:hidden p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{doc.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{doc.type} · {doc.size} · {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between ml-[52px]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStatusChange(doc.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${statusConf.bg} ${statusConf.border} ${statusConf.color}`}
                        >
                          {statusConf.icon}
                          {statusConf.label}
                          <ChevronRight size={10} className="opacity-50" />
                        </button>
                        {doc.signedAt && (
                          <span className="text-[10px] text-gray-400">Signed {doc.signedAt}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handlePreview(doc)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Eye size={14} className="text-gray-500" />
                        </button>
                        {doc.status !== 'signed' && (
                          <button onClick={() => handleOpenSignature(doc)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <PenTool size={14} className="text-gray-500" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Trash2 size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================== */}
      {/* UPLOAD MODAL */}
      {/* ============================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsUploadModalOpen(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Upload size={16} className="text-white sm:hidden" />
                  <Upload size={18} className="text-white hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Upload Document</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 ml-12 sm:ml-[52px]">Upload a contract, agreement, or any document</p>
            </div>

            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-violet-400 bg-violet-50'
                    : uploadedFile
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/30'
                }`}
              >
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                      <CheckCircle2 size={24} className="text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-green-700">{uploadedFile.name}</p>
                    <p className="text-xs text-green-500 mt-1">{formatFileSize(uploadedFile.size)}</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="mt-3 text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1">
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                      <Upload size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      {isDragOver ? 'Drop file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                    <p className="text-[10px] text-gray-300 mt-2">PDF, DOCX, XLSX, PNG, JPG — Max 25MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Document Title *</label>
                <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Investment Term Sheet..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Signatory Name *</label>
                <input type="text" value={uploadSignatory} onChange={(e) => setUploadSignatory(e.target.value)} placeholder="e.g. John Doe..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 bg-white border-2 border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold transition">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={!uploadedFile || !uploadTitle.trim() || !uploadSignatory.trim() || isUploading} className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200/60 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                {isUploading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={14} /> Upload</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* PREVIEW MODAL */}
      {/* ============================== */}
      {isPreviewOpen && previewDoc && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-3xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {getFileIcon(previewDoc.type)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{previewDoc.title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">{previewDoc.type} · {previewDoc.size}</p>
                </div>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition shrink-0">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Document Info */}
              <div className="px-5 sm:px-7 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uploaded</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">{previewDoc.uploadedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">By</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">{previewDoc.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Signatory</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">{previewDoc.signatory}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${STATUS_CONFIG[previewDoc.status].bg} ${STATUS_CONFIG[previewDoc.status].border} ${STATUS_CONFIG[previewDoc.status].color}`}>
                    {STATUS_CONFIG[previewDoc.status].icon}
                    {STATUS_CONFIG[previewDoc.status].label}
                  </span>
                </div>
              </div>

              {/* PDF Preview Area */}
              <div className="p-4 sm:p-6">
                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-8 sm:p-12 min-h-[300px] flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                    {getFileIcon(previewDoc.type)}
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-1">{previewDoc.title}</p>
                  <p className="text-xs text-gray-400 mb-6">{previewDoc.type} Document · {previewDoc.size}</p>

                  {/* Mock document content lines */}
                  <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-2 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-5/6 mb-4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-2 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-4/5 mb-4" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-2 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-3/4" />

                    {previewDoc.status === 'signed' && (
                      <div className="mt-6 pt-4 border-t border-dashed border-gray-300 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400">Signed by</p>
                          <p className="text-xs font-bold text-gray-700">{previewDoc.signatory}</p>
                          <p className="text-[10px] text-gray-400">{previewDoc.signedAt}</p>
                        </div>
                        <div className="border-b-2 border-gray-400 w-32" style={{ transform: 'rotate(-5deg)' }} />
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-400 mt-4">Document preview simulation</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-t border-gray-100 flex gap-3 shrink-0">
              <button onClick={() => setIsPreviewOpen(false)} className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition">
                Close
              </button>
              {previewDoc.status !== 'signed' && (
                <button onClick={() => { setIsPreviewOpen(false); handleOpenSignature(previewDoc); }} className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200/50 transition flex items-center justify-center gap-2">
                  <PenTool size={14} /> Sign Document
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* E-SIGNATURE MODAL */}
      {/* ============================== */}
      {isSignatureModalOpen && signatureDoc && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsSignatureModalOpen(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <PenTool size={16} className="text-white sm:hidden" />
                  <PenTool size={18} className="text-white hidden sm:block" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">E-Signature</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">{signatureDoc.title}</p>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
              {/* Signatory Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {signatureDoc.signatory.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">{signatureDoc.signatory}</p>
                  <p className="text-[11px] text-gray-400">Signatory</p>
                </div>
              </div>

              {/* Signature Type Toggle */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => { setSignatureType('draw'); setHasSigned(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${signatureType === 'draw' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <PenTool size={14} /> Draw
                </button>
                <button
                  onClick={() => { setSignatureType('type'); setHasSigned(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${signatureType === 'type' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Type size={14} /> Type
                </button>
              </div>

              {/* Signature Pad */}
              {signatureType === 'draw' ? (
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Draw your signature below</p>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 sm:h-48 bg-white border-2 border-gray-200 rounded-xl cursor-crosshair touch-none"
                    style={{ display: 'block' }}
                  />
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Type your name</p>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => { setTypedSignature(e.target.value); setHasSigned(e.target.value.trim().length > 0); }}
                    placeholder="Your full name..."
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                    style={{ fontFamily: signatureFont }}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    {SIGNATURE_FONTS.map(f => (
                      <button
                        key={f.name}
                        onClick={() => setSignatureFont(f.name)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${signatureFont === f.name ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                        style={{ fontFamily: f.name }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* Preview */}
                  {typedSignature && (
                    <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center">
                      <p className="text-2xl text-gray-800" style={{ fontFamily: signatureFont }}>{typedSignature}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Clear Button */}
              <div className="flex justify-end">
                <button onClick={clearCanvas} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition">
                  <RotateCcw size={13} /> Clear Signature
                </button>
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setIsSignatureModalOpen(false)} className="flex-1 px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold transition">
                Cancel
              </button>
              <button onClick={handleConfirmSignature} disabled={!hasSigned} className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200/50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> Confirm Signature
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-4 sm:h-6" />
    </div>
  );
};

export { DocumentsPage };