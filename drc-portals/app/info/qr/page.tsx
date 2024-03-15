import QRCode from '@/public/img/qr/CFDE-WB-QR-code.png'
import Image from 'next/image'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

export default async function Page() {
  return (
    <Grid container direction="row">
      <Grid item xs={12}>
        <Typography sx={{ml:3, mt:2, color: "secondary.dark"}} variant="h2">
          Get QR Codes
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <div className="flex flex-col items-center">
          <a className="underline text-2xl text-blue-400" href="https://cfde.info">https://cfde.info</a>
          <Image src={QRCode} width={256} height={256} alt="QR Code" />
          <div>
            <a className="underline text-2xl text-blue-500" href="/img/qr/CFDE-WB-QR-code.svg" download="CFDE-WB-QR-code.svg">SVG</a>,&nbsp;
            <a className="underline text-2xl text-blue-500" href="/img/qr/CFDE-WB-QR-code.png" download="CFDE-WB-QR-code.png">PNG</a>,&nbsp;
            <a className="underline text-2xl text-blue-500" href="/img/qr/CFDE-WB-QR-code.jpg" download="CFDE-WB-QR-code.jpg">JPG</a>
          </div>
        </div>
      </Grid>
    </Grid>
  )
}