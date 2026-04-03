import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile as fbUpdateProfile } from 'firebase/auth'
import { useAuth } from '../../hooks/useAuth'
import { auth, storage } from '../../firebase'
import Avatar  from '../ui/Avatar'
import Button  from '../ui/Button'
import { Upload } from 'lucide-react'

export default function PhotoTab() {
  const { profile, updateProfile } = useAuth()
  const fileRef   = useRef(null)
  const [preview, setPreview]  = useState(null)
  const [file,    setFile]     = useState(null)
  const [loading, setLoading]  = useState(false)
  const [success, setSuccess]  = useState(false)
  const [error,   setError]    = useState('')

  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      // Update Firebase Auth profile
      await fbUpdateProfile(auth.currentUser, { photoURL: url })
      // Update Firestore profile
      await updateProfile({ photoURL: url })
      setSuccess(true)
      setFile(null)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {success && (
        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ Profile photo updated.
        </div>
      )}
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠ {error}
        </div>
      )}

      {/* Preview */}
      <div
        className="w-24 h-24 rounded-full overflow-hidden bg-brand-100 border-2 border-brand-200 flex items-center justify-center cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <Avatar profile={profile} size={96} />
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <p className="text-xs text-ink-dim text-center">
        Click photo to select · JPG, PNG, WebP · Max 5MB
      </p>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="md"
          icon={<Upload size={14} />}
          onClick={() => fileRef.current?.click()}
        >
          Choose photo
        </Button>
        {file && (
          <Button size="md" loading={loading} onClick={handleUpload}>
            Upload
          </Button>
        )}
      </div>
    </div>
  )
}
