import { RoundBoard } from '@/components/round-board';
import { requireUser } from '@/lib/auth';
export default async function Home(){const {profile}=await requireUser();return <RoundBoard profile={profile}/>}
