import { useState, useRef, useEffect } from 'react';
import { Card } from '../components/core/Card';
import { Button } from '../components/core/Button';
import { useTenant } from '../contexts/TenantContext';
import { supabase } from '../api/supabase';
import { Mic, Square, Send, Clock, CheckCircle } from 'lucide-react';
import type { Job, VoiceEntry as VoiceEntryType } from '../api/database.types';

type VoiceEntryWithJob = VoiceEntryType & { jobs: { title: string } | null };

export function VoiceEntry() {
  const { tenant } = useTenant();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [parsedData, setParsedData] = useState<{
    billing_items?: { description: string; quantity: number; unit_price: number; type: string }[];
    tasks?: string[];
    job_notes?: string;
  } | null>(null);
  const [recentEntries, setRecentEntries] = useState<VoiceEntryWithJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [jobs, setJobs] = useState<Pick<Job, 'id' | 'title' | 'status'>[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (tenant) {
      loadJobs();
      loadRecentEntries();
    }
  }, [tenant]);

  const loadJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title, status')
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_date')
      .limit(20);
    setJobs((data || []) as Pick<Job, 'id' | 'title' | 'status'>[]);
  };

  const loadRecentEntries = async () => {
    const { data } = await supabase
      .from('voice_entries')
      .select('*, jobs(title)')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentEntries((data || []) as VoiceEntryWithJob[]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      // Simulate processing - in production, this would call Whisper API
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTranscription('Sample transcription - replace with actual Whisper API integration');
      setParsedData({
        billing_items: [
          { description: 'Labor - 2 hours', quantity: 2, unit_price: 75, type: 'labor' }
        ],
        tasks: [],
        job_notes: 'Job completed successfully'
      });

      // Save to database
      await supabase.from('voice_entries').insert({
        tenant_id: tenant?.id,
        job_id: selectedJob ? parseInt(selectedJob) : null,
        raw_transcription: 'Sample transcription',
        status: 'parsed',
        processed_at: new Date().toISOString()
      });

      loadRecentEntries();
    } catch (err) {
      console.error('Processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setTranscription('');
    setParsedData(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate mb-8">Voice Entry</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Job Selection */}
          <Card title="Select Job (Optional)">
            <select
              value={selectedJob}
              onChange={e => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No job selected - General entry</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.status})
                </option>
              ))}
            </select>
          </Card>

          {/* Recording Interface */}
          <Card title="Record Voice Entry">
            <div className="text-center py-8">
              {!audioBlob ? (
                <>
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-colors ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    <Mic size={48} className={isRecording ? 'text-red-500' : 'text-gray-400'} />
                  </div>

                  {!isRecording ? (
                    <Button onClick={startRecording} size="lg">
                      <Mic className="mr-2" size={20} />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="danger" size="lg">
                      <Square className="mr-2" size={20} />
                      Stop Recording
                    </Button>
                  )}

                  <p className="text-sm text-gray-500 mt-4">
                    {isRecording ? 'Recording... speak clearly' : 'Tap to start recording your update'}
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>

                  <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />

                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={resetRecording}>
                      Record Again
                    </Button>
                    <Button onClick={processRecording} loading={isProcessing}>
                      <Send className="mr-2" size={20} />
                      Process Recording
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Results */}
          {transcription && (
            <Card title="Transcription">
              <p className="text-gray-700">{transcription}</p>
            </Card>
          )}

          {parsedData && (
            <Card title="Extracted Data">
              {parsedData.billing_items && parsedData.billing_items.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Billing Items</h4>
                  <div className="space-y-2">
                    {parsedData.billing_items.map((item, i) => (
                      <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{item.description}</span>
                        <span className="font-medium">${(item.quantity * item.unit_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parsedData.job_notes && (
                <div>
                  <h4 className="font-medium mb-2">Job Notes</h4>
                  <p className="text-gray-600">{parsedData.job_notes}</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Recent Entries */}
        <Card title="Recent Voice Entries">
          {recentEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No voice entries yet</p>
          ) : (
            <div className="space-y-3">
              {recentEntries.map(entry => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate">
                      {entry.jobs?.title || 'General Entry'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {entry.raw_transcription || 'Processing...'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
