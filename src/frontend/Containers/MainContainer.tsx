/*global chrome*/
import { useState, useEffect } from 'react';
import { SnapShotContainer } from './SnapShotContainer';
import VisualContainer from './VisualContainer';
import { NavBar } from '../Components/NavBar/navbar'
import styled from 'styled-components';
import { GlobalStateContext } from '../Contexts/GlobalStateContext';
import { SnapShotContext } from '../Contexts/SnapShotContext';
import { fakeState } from '../../fakeState';


const Main = styled.main`
  display: flex;
  flex-wrap: wrap;
  height: 100vh;
  width: 100vw;
`;

function MainContainer() {

  const [tabNum, setTabNum] = useState<number>(1);
  const [snapShotIndex, setSnapShotIndex] = useState<number>(0);

  useEffect(() => {
    // get tab id of current tab
    const tabId = chrome.devtools.inspectedWindow.tabId;
    console.log(tabId);
    // creates a port on current tab
    const port = chrome.tabs.connect(tabId);
    port.onMessage.addListener(res => console.log('responese', res));
  }, []);

  return (
    <Main>
      <NavBar setTabNum={setTabNum} tabNum={tabNum} />
      <GlobalStateContext.Provider value={fakeState}>
        <SnapShotContext.Provider value={{ snapShotIndex, setSnapShotIndex }}>
          <SnapShotContainer />
          <VisualContainer tabNum={tabNum} />
        </SnapShotContext.Provider>
      </GlobalStateContext.Provider>
    </Main>
  );
}

export default MainContainer;