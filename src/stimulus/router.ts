import { Application } from "./application"
import { Configuration } from "./configuration"
import { ContextSet } from "./context_set"
import { ControllerConstructor } from "./controller"
import { TokenListObserver, TokenListObserverDelegate } from "sentinella"

export class Router implements TokenListObserverDelegate {
  application: Application
  private tokenListObserver: TokenListObserver
  private contextSets: Map<string, ContextSet>

  constructor(application: Application) {
    this.application = application
    this.tokenListObserver = new TokenListObserver(this.element, this.controllerAttribute, this)
    this.contextSets = new Map
  }

  get configuration(): Configuration {
    return this.application.configuration
  }

  get element(): Element {
    return this.configuration.rootElement
  }

  get controllerAttribute(): string {
    return this.configuration.controllerAttribute
  }

  start() {
    this.tokenListObserver.start()
  }

  stop() {
    this.tokenListObserver.stop()
  }

  register(identifier: string, controllerConstructor: ControllerConstructor) {
    if (this.contextSets.has(identifier)) {
      throw new Error(`Router already has a controller registered with the identifier '${identifier}'`)
    }

    const contextSet = new ContextSet(this, identifier, controllerConstructor)
    this.contextSets.set(identifier, contextSet)
    this.connectContextSet(contextSet)
  }

  // Token list observer delegate

  elementMatchedTokenForAttribute(element: Element, token: string, attributeName: string) {
    this.connectContextForIdentifierToElement(token, element)
  }

  elementUnmatchedTokenForAttribute(element: Element, token: string, attributeName: string) {
    this.disconnectContextForIdentifierFromElement(token, element)
  }

  // Contexts

  private connectContextSet(contextSet: ContextSet) {
    const elements = this.tokenListObserver.getElementsMatchingToken(contextSet.identifier)
    for (const element of elements) {
      contextSet.connect(element)
    }
  }

  private connectContextForIdentifierToElement(identifier: string, element: Element) {
    const contextSet = this.contextSets.get(identifier)
    if (contextSet) {
      contextSet.connect(element)
    }
  }

  private disconnectContextForIdentifierFromElement(identifier: string, element: Element) {
    const contextSet = this.contextSets.get(identifier)
    if (contextSet) {
      contextSet.disconnect(element)
    }
  }
}
