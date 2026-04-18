import RemoteHtmlPage from '@/src/components/ejs-partials/RemoteHtmlPage';
import ProfileEnhancer from '@/src/components/ProfileEnhancer';

export default async function ProfilePage() {
  return (
    <>
      <RemoteHtmlPage path="/profile" executeScripts={false} />
      <ProfileEnhancer />
    </>
  );
}
