import { useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { getEmailCount } from '../../lib/emailParser';

const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
const AGENT_ID = 'agent_6101kpfqckd9fka9z8a76vtpgwtp';

export default function ElevenLabsWidget() {
  const widgetRef = useRef(null);
  const { rawEmails, studentProfile, token } = useAppStore();

  const dynamicVariables = useMemo(() => {
    const clippedEmails = (rawEmails || '').slice(0, 4000);
    return {
      email_count: getEmailCount(rawEmails || ''),
      email_snippet: clippedEmails,
      student_name: studentProfile?.name || 'Student',
      degree: studentProfile?.degree || '',
      program: studentProfile?.program || '',
      semester: studentProfile?.semester || '',
      cgpa: studentProfile?.cgpa || '',
      skills: studentProfile?.skills || '',
      interests: studentProfile?.interests || '',
      is_authenticated: Boolean(token),
    };
  }, [rawEmails, studentProfile, token]);

  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!widgetRef.current) return;
    widgetRef.current.setAttribute(
      'dynamic-variables',
      JSON.stringify(dynamicVariables),
    );
  }, [dynamicVariables]);

  return (
    <elevenlabs-convai
      ref={widgetRef}
      agent-id={AGENT_ID}
      variant="compact"
      dismissible="true"
      action-text="Talk to assistant"
      expand-text="Open assistant"
      collapse-text="Close assistant"
    />
  );
}
