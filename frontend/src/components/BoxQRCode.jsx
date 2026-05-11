import { QRCodeSVG } from 'qrcode.react';

const BoxQRCode = ({ boxId }) => {
  const url = `${window.location.origin}/box/${boxId}`;
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG value={url} size={256} />
      <p className="text-sm text-gray-500">Escanea para ver el contenido</p>
    </div>
  );
};

export default BoxQRCode;
