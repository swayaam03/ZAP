import { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Upload, RotateCcw, Check } from 'lucide-react'

// Compress and resize image to maxSize x maxSize, output as base64 WebP
function compressImage(file, maxSize = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down
      if (width > height) {
        if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize }
      } else {
        if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize }
      }

      // Square crop (center)
      const size = Math.min(width, height)
      canvas.width  = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img,
        (width  - size) / 2, (height - size) / 2,
        size, size, 0, 0, size, size
      )

      // WebP at 85% quality
      const base64 = canvas.toDataURL('image/webp', 0.85)

      // Check size — base64 of 512x512 webp is ~100-200KB
      if (base64.length > 700_000) {
        // Re-compress at lower quality
        resolve(canvas.toDataURL('image/webp', 0.6))
      } else {
        resolve(base64)
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

export default function PhotoTab() {
  const { profile, updateProfile } = useAuth()
  const fileRef = useRef(null)

  const [preview,  setPreview]  = useState(null)
  const [file,     setFile]     = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  const initials = profile?.displayName
    ?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?'

  const handleFileSelect = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return

    setError('')
    setSuccess(false)

    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setFile(f)

    // Show original preview immediately
    const originalUrl = URL.createObjectURL(f)
    setPreview(originalUrl)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')

    try {
      const base64 = await compressImage(file, 512)
      await updateProfile({ photoURL: base64 })
      setSuccess(true)
      setFile(null)
      setPreview(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      await updateProfile({ photoURL: '' })
      setPreview(null)
      setFile(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentPhoto = preview || profile?.photoURL

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>

      {success && (
        <div style={{
          width:'100%', padding:'10px 14px',
          background:'#f0fdf4', border:'1px solid #bbf7d0',
          borderRadius:10, fontSize:13, color:'#15803d',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <Check size={14} /> Profile photo updated successfully.
        </div>
      )}

      {error && (
        <div style={{
          width:'100%', padding:'10px 14px',
          background:'#fef2f2', border:'1px solid #fecaca',
          borderRadius:10, fontSize:13, color:'#dc2626',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Avatar preview */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width:100, height:100, borderRadius:'50%',
          overflow:'hidden', cursor:'pointer',
          border:'2px dashed #e2e8f0',
          background:'#f8fafc',
          display:'flex', alignItems:'center', justifyContent:'center',
          position:'relative', transition:'border-color 0.15s',
          flexShrink:0,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#14b8a6'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt="Profile"
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
          />
        ) : (
          <div style={{
            width:'100%', height:'100%', background:'#f0fdfa',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:600, color:'#0d9488',
          }}>
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position:'absolute', inset:0, background:'rgba(0,0,0,0)',
          display:'flex', alignItems:'center', justifyContent:'center',
          borderRadius:'50%', transition:'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
        >
          <Upload size={20} color="transparent" style={{ transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
          />
        </div>
      </div>

      <p style={{ fontSize:12, color:'#94a3b8', textAlign:'center', margin:'-10px 0 0' }}>
        Click to choose · JPG, PNG, WebP · Max 10MB<br />
        Auto-compressed to 512×512
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display:'none' }}
        onChange={handleFileSelect}
      />

      {/* Action buttons */}
      <div style={{ display:'flex', gap:10 }}>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            padding:'9px 18px', borderRadius:10,
            border:'1.5px solid #e2e8f0', background:'#f8fafc',
            color:'#475569', fontSize:13, fontWeight:500,
            cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', gap:6,
          }}
        >
          <Upload size={13} /> Choose photo
        </button>

        {file && (
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              padding:'9px 18px', borderRadius:10,
              border:'none', background: loading ? '#5eead4' : '#14b8a6',
              color:'#fff', fontSize:13, fontWeight:500,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:6,
            }}
          >
            {loading
              ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Check size={13} /> Save photo</>
            }
          </button>
        )}

        {profile?.photoURL && !file && (
          <button
            onClick={handleRemove}
            disabled={loading}
            style={{
              padding:'9px 18px', borderRadius:10,
              border:'1.5px solid #fecaca', background:'#fef2f2',
              color:'#dc2626', fontSize:13, fontWeight:500,
              cursor:'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:6,
            }}
          >
            <RotateCcw size={13} /> Remove
          </button>
        )}
      </div>

      {/* File info */}
      {file && (
        <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center' }}>
          Selected: {file.name} ({(file.size / 1024).toFixed(0)}KB)
        </p>
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}