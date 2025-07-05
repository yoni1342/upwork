import React from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import SidePanelContent from "./sidepanelContent"

export default function SidePanel() {
  return (
    <Provider store={store}>
      <SidePanelContent />
    </Provider>
  )
}
