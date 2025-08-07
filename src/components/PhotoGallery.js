import React, { useState } from 'react'
import Styles from './styles/PhotoGallery.module.css'

import map from 'lodash/map'
import size from 'lodash/size'

const API_KEY = process.env.REACT_APP_API_KEY

const PhotoGallery = ({photos}) => {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null)

    const openModal = (index) => {
        setSelectedPhotoIndex(index)
    }

    const closeModal = () => {
        setSelectedPhotoIndex(null)
    }

    const goToPrevious = (e) => {
        e.stopPropagation()
        setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }

    const goToNext = (e) => {
        e.stopPropagation()
        setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)
    }

    const renderPhotos = (photo, index) => {
        const src = `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media&key=${API_KEY}`
        return <img
            key={photo.id}
            src={src}
            alt={photo.name}
            width={360}
            height={196}
            loading="lazy"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => openModal(index)}
        />
    }

    const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null
    const currentSrc = currentPhoto
        ? `https://www.googleapis.com/drive/v3/files/${currentPhoto.id}?alt=media&key=${API_KEY}`
        : ''

    return <>
        {size(photos)
            ? <>
                <p id={Styles.title}>
                    <b>Фото Армии</b>
                </p>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', padding: '8px 0' }}>
                    {map(photos, renderPhotos)}
                </div>
            </>
            : null
        }
        {/* Модальное окно для просмотра фото */}
        {selectedPhotoIndex !== null && <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    cursor: 'pointer',
                }}
                onClick={closeModal}
            >
                {/* Кнопка "назад" */}
                <button
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: 'none',
                        borderRadius: 50,
                        width: '30px',
                        height: '30px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 1001,
                    }}
                    onClick={goToPrevious}
                    aria-label="Previous"
                >
                    ‹
                </button>
                {/* Изображение */}
                <img
                    src={currentSrc}
                    alt={currentPhoto?.name}
                    style={{
                        maxHeight: '90vh',
                        maxWidth: '90vw',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                    onClick={(e) => e.stopPropagation()} // предотвращаем закрытие при клике на изображение
                />
                {/* Кнопка "вперёд" */}
                <button
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'white',
                        border: 'none',
                        borderRadius: 50,
                        width: '30px',
                        height: '30px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 1001,
                    }}
                    onClick={goToNext}
                    aria-label="Next"
                >
                    ›
                </button>
                {/* Закрыть (крестик) */}
                <button
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'white',
                        borderRadius: 50,
                        width: '30px',
                        height: '30px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        zIndex: 1001,
                    }}
                    onClick={closeModal}
                    aria-label="Close"
                >
                    ×
                </button>
                {/* Индикатор: 2/15 */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        color: 'white',
                        fontSize: '16px',
                        zIndex: 1001,
                    }}
                >
                    {selectedPhotoIndex + 1} / {photos.length}
                </div>
            </div>
        }
    </>
}

export default PhotoGallery