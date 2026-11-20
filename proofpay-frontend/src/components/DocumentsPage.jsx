import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  X,
  FolderOpen,
  FileImage,
  Receipt,
  Truck,
  Plus,
  Files,
  Database,
  File,
  ArrowUpRight,
  FileCheck2,
} from 'lucide-react'

const CATEGORIES = [
  'Invoice',
  'Payment Receipt',
  'Delivery Document',
  'Other',
]

const CATEGORY_ICONS = {
  Invoice: FileText,
  'Payment Receipt': Receipt,
  'Delivery Document': Truck,
  Other: FolderOpen,
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getFileType(file) {
  if (file.type === 'application/pdf') return 'PDF'
  if (file.type === 'image/png') return 'PNG'
  if (file.type === 'image/jpeg') return 'JPG'
  return 'FILE'
}

function DocumentTypeIcon({ document }) {
  const Icon =
    document.type === 'image/jpeg' || document.type === 'image/png'
      ? FileImage
      : FileText

  const isPdf = document.type === 'application/pdf'

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        isPdf ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
      }`}
    >
      <Icon size={19} strokeWidth={1.8} />
    </div>
  )
}

function StatCard({ label, value, helper, icon: Icon, tone }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{helper}</p>
    </div>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Documents')
  const [uploadCategory, setUploadCategory] = useState('Other')
  const [customerName, setCustomerName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      documents.forEach((document) => URL.revokeObjectURL(document.url))
    }
    // Object URLs are cleaned up when the page unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSize = documents.reduce((total, document) => total + document.size, 0)

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return documents.filter((document) => {
      const matchesCategory =
        activeCategory === 'All Documents' || document.category === activeCategory

      const matchesSearch = [
        document.name,
        document.category,
        document.customer,
        document.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)

      return matchesCategory && matchesSearch
    })
  }, [documents, search, activeCategory])

  const categoryCount = (category) =>
    documents.filter((document) => document.category === category).length

  function handleFiles(fileList) {
    setUploadError('')
    const files = Array.from(fileList || [])
    if (files.length === 0) return

    const acceptedDocuments = []
    const errors = []

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: only PDF, JPG, and PNG files are supported.`)
        return
      }

      if (file.size === 0) {
        errors.push(`${file.name}: empty files cannot be uploaded.`)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: the maximum file size is 10 MB.`)
        return
      }

      acceptedDocuments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        category: uploadCategory,
        customer: customerName.trim(),
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
      })
    })

    if (acceptedDocuments.length > 0) {
      setDocuments((previous) => [...acceptedDocuments, ...previous])
      setShowUploadOptions(false)
    }

    if (errors.length > 0) setUploadError(errors.join('\n'))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function deleteDocument(document) {
    const confirmed = window.confirm(`Delete "${document.name}" from this demo?`)
    if (!confirmed) return

    URL.revokeObjectURL(document.url)
    setDocuments((previous) => previous.filter((item) => item.id !== document.id))

    if (selectedDocument?.id === document.id) setSelectedDocument(null)
  }

  function downloadDocument(document) {
    const link = window.document.createElement('a')
    link.href = document.url
    link.download = document.name
    link.rel = 'noopener'
    link.click()
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
      {/* Page header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">Documents</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
            Documents
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Keep invoices, receipts, and delivery records organized in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUploadOptions(true)
            document.getElementById('document-upload-area')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:self-auto"
        >
          <Upload size={17} />
          Upload document
        </button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total documents"
          value={documents.length}
          helper="Files in your workspace"
          icon={Files}
          tone="blue"
        />
        <StatCard
          label="Invoices"
          value={categoryCount('Invoice')}
          helper="Sales and billing records"
          icon={FileText}
          tone="violet"
        />
        <StatCard
          label="Payment receipts"
          value={categoryCount('Payment Receipt')}
          helper="Proof of recorded payments"
          icon={Receipt}
          tone="green"
        />
        <StatCard
          label="Storage used"
          value={formatBytes(totalSize)}
          helper="Total size of uploaded files"
          icon={Database}
          tone="orange"
        />
      </div>

      {/* Upload area */}
      <section
        id="document-upload-area"
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
        }}
        onDrop={handleDrop}
        className={`overflow-hidden rounded-2xl border bg-white shadow-sm shadow-slate-200/30 transition ${
          dragging
            ? 'border-blue-400 ring-4 ring-blue-50'
            : 'border-slate-200/80'
        }`}
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Add a document</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Drag and drop a file here, or choose one from your computer.
              </p>
              <p className="mt-1.5 text-xs text-slate-400">
                PDF, JPG or PNG · Maximum 10 MB per file
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadOptions((previous) => !previous)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-50"
          >
            <Plus size={17} />
            {showUploadOptions ? 'Hide options' : 'Choose file'}
          </button>
        </div>

        {showUploadOptions && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block text-sm font-medium text-slate-700">
                Document category
                <select
                  value={uploadCategory}
                  onChange={(event) => setUploadCategory(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Customer name <span className="font-normal text-slate-400">(optional)</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  maxLength={100}
                  placeholder="e.g. Sharma Traders"
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Upload size={17} />
                Browse files
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />

            {uploadError && (
              <p
                role="alert"
                className="mt-4 whitespace-pre-line rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {uploadError}
              </p>
            )}
          </div>
        )}

        {!showUploadOptions && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        )}
      </section>

      {/* Documents table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/30">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Your documents</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, preview, and manage your business files.
            </p>
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents..."
              aria-label="Search documents"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3 sm:px-6">
          {['All Documents', ...CATEGORIES].map((category) => {
            const count = category === 'All Documents'
              ? documents.length
              : categoryCount(category)
            const active = activeCategory === category

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-blue-50 ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {category}
                <span className={`rounded-md px-1.5 py-0.5 text-xs ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {filteredDocuments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50/70">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-3.5">Document</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Date added</th>
                    <th className="px-4 py-3.5">File size</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((document) => {
                    const CategoryIcon = CATEGORY_ICONS[document.category] || File

                    return (
                      <tr key={document.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <DocumentTypeIcon document={document} />
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-medium text-slate-800">
                                {document.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {getFileType(document)} file
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                            <CategoryIcon size={14} />
                            {document.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {document.customer || <span className="text-slate-300">Not linked</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                          {formatDate(document.uploadedAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                          {formatBytes(document.size)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              title="Preview document"
                              aria-label={`Preview ${document.name}`}
                              onClick={() => setSelectedDocument(document)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-50"
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              type="button"
                              title="Download document"
                              aria-label={`Download ${document.name}`}
                              onClick={() => downloadDocument(document)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-50"
                            >
                              <Download size={17} />
                            </button>
                            <button
                              type="button"
                              title="Delete document"
                              aria-label={`Delete ${document.name}`}
                              onClick={() => deleteDocument(document)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing <span className="font-semibold text-slate-600">{filteredDocuments.length}</span> of{' '}
                <span className="font-semibold text-slate-600">{documents.length}</span> documents
              </span>
              <span>Files are stored in this browser session only.</span>
            </div>
          </>
        ) : (
          <div className="px-5 py-14 sm:px-6 sm:py-16">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                {search || activeCategory !== 'All Documents' ? (
                  <Search size={25} strokeWidth={1.6} />
                ) : (
                  <FolderOpen size={26} strokeWidth={1.6} />
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {search || activeCategory !== 'All Documents'
                  ? 'No matching documents'
                  : 'Your document space is ready'}
              </h3>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                {search || activeCategory !== 'All Documents'
                  ? 'Try a different search term or select another category.'
                  : 'Upload your first invoice, receipt, or delivery record to keep important business files organized.'}
              </p>
              {!search && activeCategory === 'All Documents' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadOptions(true)
                    document.getElementById('document-upload-area')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <Upload size={16} />
                  Upload your first document
                  <ArrowUpRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3.5">
        <FileCheck2 size={17} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-xs leading-5 text-slate-600">
          <span className="font-semibold text-slate-700">Demo storage:</span>{' '}
          uploaded files currently remain in temporary browser memory. Connect a backend and secure file storage before using this page for real business records.
        </p>
      </div>

      {/* Document preview modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Document preview"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <DocumentTypeIcon document={selectedDocument} />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                    {selectedDocument.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedDocument.category} · {formatBytes(selectedDocument.size)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadDocument(selectedDocument)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDocument(null)}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close preview"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="min-h-[300px] flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">
              {selectedDocument.type === 'application/pdf' ? (
                <iframe
                  title={selectedDocument.name}
                  src={selectedDocument.url}
                  className="h-[68vh] w-full rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="mx-auto max-h-[68vh] max-w-full rounded-xl object-contain shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

