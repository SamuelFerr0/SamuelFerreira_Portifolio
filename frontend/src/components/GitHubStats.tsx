import GitHubAtividade from "./GitHubAtividade";
import GitHubLinguagens from "./GitHubLinguagens";
import GitHubResumo from "./GitHubResumo";

function LinguagensEResumo() {
  return (
    <>
      <GitHubResumo />
      <GitHubLinguagens />
    </>
  );
}

const SECTION_VIEWS = {
  linguagens: LinguagensEResumo,
  atividade: GitHubAtividade,
};

type Section = keyof typeof SECTION_VIEWS;

const GitHubStats = ({ section = "linguagens" }: { section?: Section }) => {
  const View = SECTION_VIEWS[section];
  return <View />;
};

export default GitHubStats;
