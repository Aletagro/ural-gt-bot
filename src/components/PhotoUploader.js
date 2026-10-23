import React, {useState, useRef, useCallback} from 'react'
import imageCompression from 'browser-image-compression'
import {addDomainForUrl} from '../utilities/utils'

import size from 'lodash/size'
import take from 'lodash/take'
import startsWith from 'lodash/startsWith'

import Styles from './styles/PhotoUploader.module.css'

function PhotoUploader({onUploadSuccess, photoUrls, apiUrl, onDeletePhoto, maxFiles = 1}) {
  const [previews, setPreviews] = useState(photoUrls || [])
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const fileInputRef = useRef(null)

  const handleZoneClick = (e) => {
    // Если кликнули по кнопке удаления, не открываем выбор файла
    if (e.target.closest(`.${Styles.deleteBadge}`)) return;
    if (!loading) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (event) => {
    let files = Array.from(event.target.files)
    if (size(files) === 0) return
    if (maxFiles > 1) {
      const allowedCount = maxFiles - size(previews)
      if (allowedCount <= 0) {
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      if (size(files) > allowedCount) {
        files = take(files, allowedCount)
      }
    }
    setLoading(true)
    if (maxFiles === 1) {
      setPreviews([])
    }
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg'
    }
    try {
      for (let i = 0; i < size(files); i++) {
        const file = files[i];
        const fileNumberText = maxFiles > 1 ? ` (${i + 1}/${size(files)})` : '';
        setStatusText(`Сжатие фото${fileNumberText}...`)
        const compressedFile = await imageCompression(file, options)
        setStatusText(`Загрузка фото${fileNumberText}...`)
        const formData = new FormData()
        formData.append('file', compressedFile, `army-photo-${i}.jpg`)
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': "application/json, text/javascript, */*; q=0.01"
          }
        })
        if (response.ok) {
          const data = await response.json()
          const newUrls = data.paths || [data.url]
          setPreviews(newUrls)
          if (onUploadSuccess) {
            onUploadSuccess(newUrls)
          }
        } else {
          throw new Error(`Ошибка сервера на файле №${i + 1}`)
        }
      }
    } catch (error) {
        console.error('Ошибка при обработке файлов:', error)
        alert('Не удалось сжать или загрузить некоторые изображения.')
    } finally {
      setLoading(false)
      setStatusText('')
      if (fileInputRef.current) {
          fileInputRef.current.value = ''
      }
    }
  }

  const extractPhotoId = useCallback((photoUrl) => {
    if (!photoUrl) return ''
    const regex = /\d+_\d+_\d+/
    const match = photoUrl.match(regex)
    return match ? match[0] : ''
}, [])

  const handleDeletePhoto = useCallback((indexToDelete, e) => {
    e.stopPropagation()
    setPreviews(prev => prev.filter((_, index) => index !== indexToDelete))
    if (onDeletePhoto) {
      const photoId = extractPhotoId(previews[indexToDelete])
      if (photoId) {
        onDeletePhoto(photoId)
      }
    }
  }, [previews, extractPhotoId, onDeletePhoto])

  const isMultipleMode = maxFiles > 1
  const hasPhotos = size(previews) > 0

  return <div className={Styles.mainWrapper}>
    <label id={Styles.label}>
      {isMultipleMode ? `Фотографии армии (до ${maxFiles} шт.)` : 'Фотография вашей армии'}
    </label>
    <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={isMultipleMode}
        id={Styles.hiddenInput}
    />
    <div 
      id={Styles.uploaderContainer} 
      className={hasPhotos && isMultipleMode ? Styles.containerMultiple : ''}
      onClick={handleZoneClick}
    >
      {hasPhotos
        ? <div className={isMultipleMode ? Styles.previewsGrid : Styles.previewWrapper}>
          {previews.map((src, index) => (
            <div key={index} className={isMultipleMode ? Styles.gridItem : Styles.singleItem}>
              <img src={startsWith(src, '/') ? addDomainForUrl(src) : src} alt={`Army Preview ${index + 1}`} id={Styles.previewImage} />
              {isMultipleMode && (
                <div className={Styles.deleteBadge} onClick={(e) => handleDeletePhoto(index, e)}>
                  ✕
                </div>
              )}
            </div>
          ))}
          {isMultipleMode && size(previews) < maxFiles && !loading && (
            <div className={Styles.addMoreBlock}>
              <span className={Styles.addIcon}>+</span>
              <span className={Styles.addText}>Добавить</span>
            </div>
          )}
          {!isMultipleMode && <div id={Styles.overlay}>📸 Изменить фотографию</div>}
        </div>
        : <div id={Styles.placeholderContent}>
            <span id={Styles.icon}>📷</span>
            <span id={Styles.text}>Нажмите, чтобы загрузить фото</span>
            <span id={Styles.subtext}>
              {isMultipleMode ? `Вы можете выбрать сразу до ${maxFiles} файлов` : 'Камера или галерея (до 5 МБ)'}
            </span>
        </div>
      }
      {loading
        ? <div id={Styles.loaderOverlay}>
            <div id={Styles.spinner}></div>
            <span id={Styles.statusText}>{statusText}</span>
        </div>
        : null
      }
    </div>
  </div>
}

export default PhotoUploader
