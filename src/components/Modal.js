import React, {useState, useEffect} from 'react'
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import ModalDialog from '@mui/joy/ModalDialog'
import DialogTitle from '@mui/joy/DialogTitle'
import DialogContent from '@mui/joy/DialogContent'
import Ability from './Ability'

import Styles from './styles/Modal.module.css'

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
        <Modal open={visible} onClose={handleClose}>
        <ModalDialog layout='center'>
            <ModalClose />
            {ability
                ? <div id={Styles.abilityContainer}>
                    <Ability ability={ability} />
                </div>
                : <>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        {Content
                            ? renderContent()
                            : <p id={Styles.text}>{text}</p>
                        }
                    </DialogContent>
                </>
            }
        </ModalDialog>
        </Modal>
    </>
}


export default CustomModal