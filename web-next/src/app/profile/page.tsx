import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import ProfileEnhancer from '@/components/ProfileEnhancer';

export default async function ProfilePage() {
  return (
    <>
      <RemoteHtmlPage path="/profile" executeScripts={false} />
      <ProfileEnhancer />
    </>
  );
}
