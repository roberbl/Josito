import type { Match, Participant, Prediction, RoundScore } from './types';

const picks = ['1','X','2'] as const;
export function randomPrediction(participant_id:string,matches:Match[],plenoMatchId?:string):Prediction{
  return {participant_id,is_default:true,items:matches.map((m,i)=>({match_id:m.id,pick:picks[(i+participant_id.length)%3],highlighted:i<8,pleno_score:m.id===plenoMatchId?'1-1':undefined}))};
}
export function validatePrediction(prediction:Prediction,matches:Match[]){
  if(prediction.items.length!==14) throw new Error('La quiniela debe tener 14 pronósticos.');
  if(prediction.items.filter(i=>i.highlighted).length!==8) throw new Error('Debes seleccionar exactamente 8 partidos destacados.');
  const matchIds=new Set(matches.map(m=>m.id));
  for(const item of prediction.items){ if(!matchIds.has(item.match_id)) throw new Error('Partido inválido.'); }
}
export function calculateRoundScores(params:{matches:Match[];predictions:Prediction[];qualified:Participant[];previousCopitaId?:string;manualOrder?:Record<string,number>}):RoundScore[]{
  const pleno=params.matches.find(m=>m.is_pleno);
  const predictionsByUser=new Map(params.predictions.map(p=>[p.participant_id,p]));
  const rows=params.qualified.map(participant=>{
    const prediction=predictionsByUser.get(participant.id) ?? randomPrediction(participant.id,params.matches,pleno?.id);
    let regular=0,segunda=0,away=0,draw=0,plenoPoints=0;
    for(const item of prediction.items){
      const match=params.matches.find(m=>m.id===item.match_id); if(!match?.result) continue;
      if(item.pick===match.result){ regular++; if(match.division==='segunda') segunda++; if(item.pick==='2') away++; if(item.pick==='X') draw++; }
      if(match?.is_pleno && item.pleno_score && match.pleno_score && item.pleno_score.trim()===match.pleno_score.trim()) plenoPoints=4;
    }
    const raw=regular+plenoPoints;
    const total=prediction.is_default ? raw/2 : raw;
    return {participant_id:participant.id,regular_points:regular,pleno_points:plenoPoints,total_points:total,segunda_hits:segunda,away_hits:away,draw_hits:draw,is_default:prediction.is_default,eliminated:prediction.is_default,saved_by_copita:false,rank:0} satisfies RoundScore;
  });
  rows.sort((a,b)=> b.total_points-a.total_points || b.segunda_hits-a.segunda_hits || b.away_hits-a.away_hits || b.draw_hits-a.draw_hits || copitaTie(a,b,params.previousCopitaId) || ((params.manualOrder?.[a.participant_id]??999)-(params.manualOrder?.[b.participant_id]??999)) || a.participant_id.localeCompare(b.participant_id));
  rows.forEach((r,i)=>r.rank=i+1);
  const copita=params.previousCopitaId ? rows.find(r=>r.participant_id===params.previousCopitaId) : undefined;
  if(copita && copita.pleno_points===4 && !copita.is_default){ copita.saved_by_copita=true; copita.eliminated=false; }
  rows.forEach((r,i)=>{ if(i>=4 && !r.saved_by_copita) r.eliminated=true; });
  return rows;
}
function copitaTie(a:RoundScore,b:RoundScore,copita?:string){ if(!copita) return 0; if(a.participant_id===copita) return 1; if(b.participant_id===copita) return -1; return 0; }

export type SeasonPrediction = Record<string,string|string[]> & { double_category?: string };
export function scoreSeasonPrediction(pred:SeasonPrediction, actual:SeasonPrediction){
  const simple=['campeon_liga','pichichi','zarra','menos_goleado','maximo_goleador','primer_destituido'];
  let points=0;
  for(const key of simple) if(pred[key] && pred[key]===actual[key]) points += pred.double_category===key ? 10 : 5;
  const groups=[['champions',15],['europa',0],['descensos_primera',15],['ascensos_primera',15],['descensos_rfef',15]] as const;
  for(const [key,bonus] of groups){
    const p=(pred[key] as string[])||[], a=(actual[key] as string[])||[]; let exact=true;
    p.forEach((team,idx)=>{ const pos=a.indexOf(team); if(pos>=0) points+=3; if(a[idx]===team) points+=5; else exact=false; });
    if(exact && p.length===a.length && p.length>0) points+=bonus;
  }
  return points;
}
