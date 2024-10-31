import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuList,
  Popover,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ShareIcon from '@mui/icons-material/Share';
import EmailIcon from '@mui/icons-material/Email';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ExportIcon from '@mui/icons-material/ImportExport';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc } from '../../../firebase';
import { useAuth } from '../../../AuthContext';

// Import the necessary libraries for file generation and download
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document as DocxDocument, Packer, Paragraph } from 'docx';

const FileMenu = ({ documentId, onShareOpen, documentData }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadClick = (event) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
  };

  const handleNew = () => {
    router.push('/new-document');
    handleClose();
  };

  const handleOpen = () => {
    router.push('/open-document');
    handleClose();
  };

  const handleMakeCopy = () => {
    // Logic for making a copy of the document
    console.log('Make a copy');
    handleClose();
  };

  const handleShare = () => {
    onShareOpen();
    handleClose();
  };

  const handleEmail = () => {
    // Logic for emailing the document
    console.log('Email document');
    handleClose();
  };

  const handleDownload = async (format) => {
    const content = typeof documentData === 'string' ? documentData : documentData?.content || '';
    if (!content) {
      console.error('No content to download');
      return;
    }

    switch (format) {
      case 'pdf':
        // Generate PDF and trigger download
        const pdfDoc = new jsPDF();
        const pdfLines = pdfDoc.splitTextToSize(content, 180);
        pdfDoc.text(pdfLines, 10, 10);
        pdfDoc.save('document.pdf');
        break;
      case 'md':
        // Create a blob and trigger download as .md
        const mdBlob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        saveAs(mdBlob, 'document.md');
        break;
      case 'txt':
        // Create a blob and trigger download as .txt
        const txtBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(txtBlob, 'document.txt');
        break;
      case 'docx':
        // Generate docx and trigger download
        const docxDoc = new DocxDocument();
        const lines = content.split('\n');
        const paragraphs = lines.map((line) => new Paragraph(line));
        docxDoc.addSection({
          properties: {},
          children: paragraphs,
        });

        const blob = await Packer.toBlob(docxDoc);
        saveAs(blob, 'document.docx');
        break;
      default:
        console.error('Unsupported format');
    }

    handleDownloadClose();
    handleClose();
  };

  const handleMoveToBin = async () => {
    if (!documentId) return;
    const confirmDelete = confirm('Are you sure you want to move this document to the bin?');
    if (confirmDelete) {
      try {
        const docRef = doc(firestore, 'documents', documentId);
        await deleteDoc(docRef);
        router.push('/');
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
    handleClose();
  };

  const handleExport = () => {
    // Logic for exporting the document
    console.log('Export document');
    handleClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        className="option"
        sx={{ padding: 0, marginRight: 1 }}
      >
        <p className="option text-sm">File</p>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleNew}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpen}>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMakeCopy}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Make a copy</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEmail}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadClick}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoveToBin}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to bin</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
      </Menu>

      <Popover
        open={Boolean(downloadAnchorEl)}
        anchorEl={downloadAnchorEl}
        onClose={handleDownloadClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList>
          <MenuItem onClick={() => handleDownload('pdf')}>PDF</MenuItem>
          <MenuItem onClick={() => handleDownload('md')}>Markdown</MenuItem>
          <MenuItem onClick={() => handleDownload('txt')}>Text</MenuItem>
          <MenuItem onClick={() => handleDownload('docx')}>Word</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};

export default FileMenu;
