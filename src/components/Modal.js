import React, {useState, useEffect} from 'react'
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import ModalDialog from '@mui/joy/ModalDialog'
import DialogTitle from '@mui/joy/DialogTitle'
import DialogContent from '@mui/joy/DialogContent'
import Ability from './Ability'

import Styles from './styles/Modal.module.css'

// Оформление окна в стиле новых экранов: кремовый фон, золотая рамка, затемнение с размытием
const backdropSx = {backgroundColor: 'rgba(18, 14, 7, 0.65)', backdropFilter: 'blur(3px)'}

const getDialogSx = (isCard) => ({
    width: 'min(92vw, 420px)',
    maxHeight: '86vh',
    overflowY: 'auto',
    padding: isCard ? '34px 10px 10px' : '22px 18px 18px',
    border: '2px solid #b0953f',
    borderRadius: '20px',
    backgroundColor: '#fffdf8',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
})

const closeSx = {
    top: 10,
    right: 10,
    paddingBottom: 10,
    borderRadius: '50%',
    color: '#8a6d1f',
    '&:hover': {backgroundColor: 'rgba(176, 149, 63, 0.18)'},
}

// Заголовок по центру с золотой линией, тающей к краям
const titleSx = {
    position: 'relative',
    justifyContent: 'center',
    margin: '0 14px 14px',
    paddingBottom: '12px',
    fontFamily: 'Minion Pro Bold',
    fontSize: '19px',
    lineHeight: 1.25,
    textAlign: 'center',
    color: '#1d1810',
    '&::after': {
        content: '""',
        position: 'absolute',
        left: '8%',
        right: '8%',
        bottom: 0,
        height: '1px',
        background: 'linear-gradient(to right, rgba(176, 149, 63, 0), #b0953f, rgba(176, 149, 63, 0))',
    },
}

const contentSx = {
    fontFamily: 'Minion Pro Regular',
    fontSize: '16px',
    color: '#3a3220',
}

const CustomModal = ({title, text, visible, ability, onClose, Content}) => {
    const [_visible, setVisible] = useState(visible)

    useEffect(() => {
        if (_visible) {
            setVisible(true)
        }
    }, [visible, _visible])

    const handleClose = () => {
        setVisible(false)
        if (onClose) {
            onClose()
        }
    }

    const renderContent = () => Content()

    return <>
        <Modal open={visible} onClose={handleClose} slotProps={{backdrop: {sx: backdropSx}}}>
        <ModalDialog layout='center' sx={getDialogSx(Boolean(ability))}>
            <ModalClose sx={closeSx} />
            {ability
                ? <div id={Styles.abilityContainer}>
                    <Ability ability={ability} />
                </div>
                : <div id={Styles.abilityContainer}>
                    {title ? <DialogTitle sx={titleSx}>{title}</DialogTitle> : null}
                    <DialogContent sx={contentSx}>
                        {Content
                            ? renderContent()
                            : <p id={Styles.text}>{text}</p>
                        }
                    </DialogContent>
                </div>
            }
        </ModalDialog>
        </Modal>
    </>
}


export default CustomModal