-- Enable the complete SVO Protocol for teacher assignment after preview and RPC acceptance checks.
do $$
declare num integer;
begin
 select count(*) into num from public.svo_unit_specs;
 if num<>19 then raise exception 'Expected 19 new SVO units; found %',num;end if;
 select count(*) into num from public.svo_vocabulary;
 if num<200 then raise exception 'Cumulative source vocabulary is incomplete';end if;
 select count(*) into num from public.lesson_activity_definitions d
  join public.svo_unit_specs s on s.episode_id=d.episode_id;
 if num<>165 then raise exception 'Expected 165 new activity definitions; got %',num;end if;
 select count(*) into num from public.lesson_assessment_schemas a
  join public.svo_unit_specs s on s.episode_id=a.episode_id;
 if num<>19 then raise exception 'Expected 19 assessment rubrics; got %',num;end if;
 select count(*) into num from public.stark_catalog_units u
  join public.stark_catalog_collections c on c.id=u.collection_id
  where c.slug='svo';
 if num<>20 then raise exception 'SVO curriculum should contain 20 units; got %',num;end if;
 update public.episodes e set status='published',updated_at=now()
 where e.status='draft' and exists(
   select 1 from public.svo_unit_specs s where s.episode_id=e.id);
 update public.stark_catalog_units u set status='published',title_verified=true,updated_at=now()
 where u.code='SVO-L01' or exists(
   select 1 from public.svo_unit_specs s join public.episodes e on e.id=s.episode_id
   where e.code=u.code);
 update public.stark_catalog_collections c set status='published',updated_at=now()
 where c.slug='svo' and c.course_id=(select id from public.courses where slug='stark-english');
end $$;