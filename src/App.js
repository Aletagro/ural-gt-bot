import {useEffect, useState} from 'react'
import {Route, Routes} from 'react-router-dom'
import useSwipeBack from './utilities/useSwipeBack'
import Registration from './screens/Registration'
import RosterScreen from './screens/RosterScreen'
import TournamentRules from './screens/TournamentRules'
import AppendixRules from './screens/AppendixRules'
import Photovalidation from './screens/Photovalidation'
import Challenges from './screens/Challenges'
import Players from './screens/Players'
import PlayerInfo from './screens/PlayerInfo'
import Rosters from './screens/Rosters'
import Rounds from './screens/Rounds'
import Play from './screens/Play'
import Vote from './screens/Vote'
import PaintVote from './screens/PaintVote'
import PaintVoteReg from './screens/PaintVoteReg'
import Admin from './screens/Admin'
import Help from './screens/Help'
import MainRules from './screens/MainRules'
import Catalog from './screens/Catalog'
import Army from './screens/Army'
import Units from './screens/Units'
import Warscroll from './screens/Warscroll'
import ArmyInfo from './screens/ArmyInfo'
import RegimentsOfRenownList from './screens/RegimentsOfRenownList'
import RegimentOfRenown from './screens/RegimentOfRenown'
import Search from './screens/Search'
import CoreDocuments from './screens/CoreDocuments'
import RuleSections from './screens/RuleSections'
import RuFAQ from './screens/RuFAQ'
import RuleChapters from './screens/RuleChapters'
import Manifestations from './screens/Manifestations'
import Rules from './screens/Rules'
import Battleplan from './screens/Battleplan'
import Legends from './screens/Legends'
import LegendUnits from './screens/LegendUnits'
import Tactic from './screens/Tactic'
import Developer from './screens/Developer'
import LinkAccounts from './screens/LinkAccounts'
import Leaders from './screens/Leaders'
import StatisticsTabs from './screens/StatisticsTabs'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import ChooseGrandAlliance from './builder/ChooseGrandAlliance'
import ChooseFaction from './builder/ChooseFaction'
import Builder from './builder/Builder'
import AddUnit from './builder/AddUnit'
import ChooseEnhancement from './builder/ChooseEnhancement'
import ChooseOption from './builder/ChooseOption'
import ChooseWeapon from './builder/ChooseWeapon'
import Export from './builder/Export'
import BuilderChooseTacticsCard from './builder/BuilderChooseTacticsCard'
import PasteList from './builder/PasteList'
import Calculator from './calculator/Calculator'

import './App.css'

const tg = window.Telegram?.WebApp

function App() {
  useSwipeBack()
  const [shareAction, setShareAction] = useState(null)

  useEffect(() => {
    tg?.ready()
    if (!tg.isExpanded) {
      tg.expand()
    }
    if (!tg.isClosingConfirmationEnabled) {
      tg.enableClosingConfirmation()
    }
  }, [])

  return <div>
    <Header onShare={shareAction} />
    <ScrollToTop />
    <Routes>
      <Route index element={<Registration />} />
      <Route path={'roster'} element={<RosterScreen />} />
      <Route path={'tournamentRules'} element={<TournamentRules />} />
      <Route path={'appendixRules'} element={<AppendixRules />} />
      <Route path={'photovalidation'} element={<Photovalidation />} />
      <Route path={'challenges'} element={<Challenges />} />
      <Route path={'players'} element={<Players />} />
      <Route path={'playerInfo'} element={<PlayerInfo setShareAction={setShareAction} />} />
      <Route path={'rosters'} element={<Rosters setShareAction={setShareAction} />} />
      <Route path={'rounds'} element={<Rounds />} />
      <Route path={'play'} element={<Play setShareAction={setShareAction} />} />
      <Route path={'vote'} element={<Vote />} />
      <Route path={'paintVote'} element={<PaintVote />} />
      <Route path={'paintVoteReg'} element={<PaintVoteReg />} />
      <Route path={'admin'} element={<Admin />} />
      <Route path={'help'} element={<Help />} />
      <Route path={'mainRules'} element={<MainRules />} />
      <Route path={'catalog'} element={<Catalog />} />
      <Route path={'army'} element={<Army />} />
      <Route path={'armyOfRenown'} element={<Army />} />
      <Route path={'units'} element={<Units />} />
      <Route path={'warscroll'} element={<Warscroll />} />
      <Route path={'calculator'} element={<Calculator />} />
      <Route path={'armyInfo'} element={<ArmyInfo />} />
      <Route path={'builder'} element={<Builder />} />
      <Route path={'addUnit'} element={<AddUnit />} />
      <Route path={'regimentOfRenown'} element={<RegimentOfRenown />} />
      <Route path={'regimentOfRenownList'} element={<RegimentsOfRenownList />} />
      <Route path={'chooseEnhancement'} element={<ChooseEnhancement />} />
      <Route path={'chooseOption'} element={<ChooseOption />} />
      <Route path={'chooseWeapon'} element={<ChooseWeapon />} />
      <Route path={'search'} element={<Search />} />
      <Route path={'coreDocuments'} element={<CoreDocuments />} />
      <Route path={'ruFAQ'} element={<RuFAQ />} />
      <Route path={'ruleSections'} element={<RuleSections />} />
      <Route path={'ruleChapters'} element={<RuleChapters />} />
      <Route path={'rules'} element={<Rules />} />
      <Route path={'battleplan'} element={<Battleplan />} />
      <Route path={'manifestations'} element={<Manifestations />} />
      <Route path={'legends'} element={<Legends />} />
      <Route path={'legendUnits'} element={<LegendUnits />} />
      <Route path={'chooseGrandAlliance'} element={<ChooseGrandAlliance />} />
      <Route path={'chooseFaction'} element={<ChooseFaction />} />
      <Route path={'export'} element={<Export />} />
      <Route path={'developer'} element={<Developer />} />
      <Route path={'builderChooseTacticsCard'} element={<BuilderChooseTacticsCard />} />
      <Route path={'tactic'} element={<Tactic />} />
      <Route path={'pasteList'} element={<PasteList />} />
      <Route path={'linkAccounts'} element={<LinkAccounts />} />
      <Route path={'leaders'} element={<Leaders />} />
      <Route path={'statisticsTabs'} element={<StatisticsTabs />} />
    </Routes>
  </div>
}

export default App;
