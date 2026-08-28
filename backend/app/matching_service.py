import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
WEIGHTS={"skill":.40,"interest":.15,"experience":.15,"talent":.10,"domain":.10,"complementary":.10}
def words(x): return set(re.findall(r"[a-zA-Z0-9+#/.]+",(x or "").lower()))
def sim(a,b):
 if not a or not b:return 0
 try:return float(cosine_similarity(TfidfVectorizer().fit_transform([a,b]))[0][1])*100
 except:return 0
def match(project, profile, user):
 req=words(project.required_skills); have=words(profile.skills); matched=sorted(req&have); missing=sorted(req-have); complementary=sorted((words(profile.skills)|words(profile.talents)|words(profile.interests))&set(missing))
 skill=len(matched)/max(len(req),1)*100
 interest=sim(project.description+" "+project.domain,profile.interests+" "+profile.bio)
 experience=sim(project.required_experience,profile.experience) if project.required_experience else (70 if profile.experience else 20)
 talent=sim(project.required_talents,profile.talents) if project.required_talents else 50
 domain=100 if project.domain and project.domain.lower() in (profile.domain+" "+profile.interests).lower() else sim(project.domain,profile.domain)
 comp=len(complementary)/max(len(req),1)*100
 total=round(skill*.4+interest*.15+experience*.15+talent*.1+domain*.1+comp*.1)
 reasons=[]
 if matched: reasons.append("Strong match for required skills")
 if complementary: reasons.append("Provides complementary skills")
 if interest>=60: reasons.append("Shares relevant interests")
 if experience>=60: reasons.append("Has relevant experience")
 return {"student_id":user.id,"name":user.name,"college":user.college,"department":user.department,"year":user.year,"score":total,"skill_score":round(skill),"interest_score":round(interest),"experience_score":round(experience),"talent_score":round(talent),"domain_score":round(domain),"complementary_score":round(comp),"matching_skills":matched,"missing_skills":missing,"complementary_skills":complementary,"reasons":reasons}
