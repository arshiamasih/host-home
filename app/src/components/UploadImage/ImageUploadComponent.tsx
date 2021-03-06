import React, { useRef } from 'react'
// import Box from '@material-ui/core/Box'
import UploadImageButton from './UploadImageButton'
import { Container, Typography, Box } from '@material-ui/core'
import { Photo } from '../../models/v2'

interface ImageUploadComponentProps {
    uploadAll?: (images: Array<File>) => void
    images?: Array<Photo>
    heading?: string
}

function ImageUploadComponent(props: ImageUploadComponentProps) {
    return (
        <Container maxWidth="lg">
            <Box display="flex" flexDirection="column" justifyContent="center">
                <div>
                    <Typography variant="h5">
                        {props.heading || 'Please upload photo:'}
                    </Typography>
                </div>
                <div>
                    <UploadImageButton
                        uploadAll={props.uploadAll}
                        images={props.images}
                    />
                </div>
            </Box>
        </Container>
    )
}

export default ImageUploadComponent
