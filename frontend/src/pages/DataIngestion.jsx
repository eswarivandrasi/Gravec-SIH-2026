import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Image as ImageIcon, CheckCircle2, AlertTriangle, Download, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';

export const DataIngestion = () => {
  const { addToast } = useNotification();
  const [csvFile, setCsvFile] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [cycloneName, setCycloneName] = useState('Cyclone VAYU-26');
  const [basin, setBasin] = useState('Bay of Bengal');
  const [satelliteType, setSatelliteType] = useState('INSAT-3DR / Multi-spectral');
  const [channel, setChannel] = useState('Infrared (TIR1)');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!csvFile && !imgFile) {
      addToast("Please select a CSV file or satellite image to upload.", "warning");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      if (csvFile) formData.append('file', csvFile);
      else if (imgFile) formData.append('file', imgFile);

      formData.append('cyclone_name', cycloneName);
      formData.append('basin', basin);
      formData.append('satellite_type', satelliteType);
      formData.append('channel', channel);

      const res = await api.uploadData(formData);
      setUploadResult(res.data);
      addToast(res.data.message, "success");
      setCsvFile(null);
      setImgFile(null);
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload validation failed";
      addToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  const sampleCsvContent = `timestamp,latitude,longitude,wind_speed,pressure,sst,movement_direction,movement_speed
2026-09-26T00:00:00,14.8,85.2,125.0,978.0,30.2,NNW,15.0
2026-09-26T06:00:00,15.2,84.7,135.0,974.0,30.4,NNW,15.5
2026-09-26T12:00:00,15.6,84.4,142.0,970.0,30.5,NNW,16.0
2026-09-26T18:00:00,16.0,84.0,150.0,965.0,30.6,NNW,16.2`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_cyclone_telemetry.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Multi-Source Telemetry Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Data Ingestion & Satellite Imagery Upload
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest real-time or historical multi-spectral satellite imagery and environmental CSV observations with automatic schema validation.
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: File Upload Zones */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            1. Select File Format
          </h2>

          {/* CSV File Input */}
          <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
            csvFile ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">Environmental Observations (.CSV)</div>
                <p className="text-[11px] text-slate-400">Time-series: wind, pressure, SST, trajectory</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => { setCsvFile(e.target.files[0]); setImgFile(null); }}
                  className="mt-2 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer"
                />
              </div>
            </div>
            {csvFile && (
              <div className="mt-2 text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 font-mono">— OR —</div>

          {/* Image File Input */}
          <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
            imgFile ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">Satellite Imagery (.JPG, .PNG)</div>
                <p className="text-[11px] text-slate-400">Doppler radar or IR cloud structure</p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => { setImgFile(e.target.files[0]); setCsvFile(null); }}
                  className="mt-2 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 file:text-emerald-300 hover:file:bg-emerald-900 cursor-pointer"
                />
              </div>
            </div>
            {imgFile && (
              <div className="mt-2 text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {imgFile.name} ({(imgFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Metadata Tagging */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              2. Metadata & Sensor Calibration
            </h2>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Target Storm System Name</label>
              <input
                type="text"
                value={cycloneName}
                onChange={(e) => setCycloneName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-xs font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Basin Area</label>
                <select
                  value={basin}
                  onChange={(e) => setBasin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-xs font-mono"
                >
                  <option value="Bay of Bengal">Bay of Bengal</option>
                  <option value="Arabian Sea">Arabian Sea</option>
                  <option value="North Indian Ocean">North Indian Ocean</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Sensor Constellation</label>
                <select
                  value={satelliteType}
                  onChange={(e) => setSatelliteType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-xs font-mono"
                >
                  <option value="INSAT-3DR / Multi-spectral">INSAT-3DR (ISRO)</option>
                  <option value="INSAT-3D TIR">INSAT-3D TIR</option>
                  <option value="Oceansat-3 Scatterometer">Oceansat-3</option>
                  <option value="NOAA-20 / VIIRS">NOAA-20 / VIIRS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Spectral Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-xs font-mono"
              >
                <option value="Infrared (TIR1 - 10.8µm)">Infrared (TIR1 - 10.8µm)</option>
                <option value="Water Vapor (6.8µm)">Water Vapor (6.8µm)</option>
                <option value="Visible Channel (0.65µm)">Visible Channel (0.65µm)</option>
                <option value="Doppler Radar Composite">Doppler Radar Composite</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || (!csvFile && !imgFile)}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-transform active:scale-95"
          >
            {uploading ? (
              <span>Validating & Processing Ingestion Pipeline...</span>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Validate & Ingest Telemetry</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Upload Success Output Card */}
      {uploadResult && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-5 rounded-3xl space-y-2 animate-fadeIn font-mono text-xs">
          <div className="text-emerald-300 font-bold flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Telemetry Successfully Ingested & Registered!</span>
          </div>
          <p className="text-slate-200">{uploadResult.message}</p>
          <div className="pt-2 flex gap-4 text-[11px] text-slate-300">
            <span>System ID: <strong>{uploadResult.cyclone_id}</strong></span>
            <span>Name: <strong>{uploadResult.cyclone_name}</strong></span>
            {uploadResult.records_count && <span>Records Added: <strong>{uploadResult.records_count}</strong></span>}
          </div>
        </div>
      )}

    </div>
  );
};

export default DataIngestion;
