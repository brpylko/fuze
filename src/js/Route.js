// Variables outside of the class to ensure that they are "private"
let instance = false
let routes
let urlMod
let navType
let basePath
const navTypeValues = ["path", "hash"]
const listenerFunction = () => {
    //useful stuff:
    // e.target.location.hash: "#test"
    // e.target.location.pathname: "/html5-pushstate-and-single-page-apps/"
    // e.target.location.href: "https://www.frontendjournal.com/html5-pushstate-and-single-page-apps/#test"
    // e.target.location.origin: "https://www.frontendjournal.com"
    let route
    if (navType == "hash") {
        route = location.hash
    } else { // navType == "path"
        // Should probably investigate different ways to do this:
        // https://stackoverflow.com/questions/9928679/remove-the-string-on-the-beginning-of-an-url
        route = location.pathname.slice(basePath.length) // This will break if the entire path changes
    }
    routes[route].load()
}
/**
 * Singleton class to handle routing.
 */
class Route {
    /**
     * Route constructor, only allows one instance
     */
    constructor() {
        if (instance) {
            throw new Error("Routing can only be initialized once.")
        }
        routes = {}
        instance = true
    }

    /**
     * initialization of Fuze routing
     * @param {Object} settings object containing all settings
     *          urlMod: bool determines if url should be modified
     *          navType: string with one of the following values: ["hash", "path"]
     *          basePath: string to represent base path of url to derive actual path from
     * @returns {void}
     */
    static init(settings) {
        if (instance) {
            // Need to send some error saying routing has already been initialized
            throw new Error("Routing can only be initialized once.")
        }
        new Route()
        // Set urlMod value, default to True
        urlMod = ("urlMod" in settings ? settings.urlMod : true)
        // Set navType value, if navType or basePath is set,
        navType = ("navType" in settings && settings.navType in navTypeValues ? settings.navType : ("basePath" in settings ? "path" : "hash"))
        // set basePath value, default to "", if true, set basePath to currentPath
        if ("basePath" in settings && navType != "hash") {
            if (typeof settings.basePath === "boolean" && settings.basePath) {
                basePath = location.pathname
            } else {
                basePath = settings.basePath || ""
            }
        } else {
            basePath = ""
        }
    }

    /**
     * registers route to the route obj accessed via Route class
     * @param {Object} obj object that contains load() method to be added to routing
     * @param {String} route string representing route that causes obj to load
     * @returns {void}
     */
    static register(obj, route) {
        // If instance does not yet exist, create one using default values
        if (!instance) {
            Route.init()
        }
        if (typeof obj.load === "function") {
            routes[route] = obj
        } else {
            throw new Error("object needs to have a load method.")
        }
    }

    /**
     * Removes route from registered routes
     * @param {String} route string representing route to be removed
     * @returns {void}
     */
    static unRegister(route) {
        delete routes[route]
    }

    /**
     * Loads provided route
     * @param {String} route route that has already been registered to load
     * @returns {void}
     */
    static go(route) {
        if (urlMod) {
            window.history.pushState({}, document.title, route)
        }
        routes[route].load()
    }

    /**
     * Attaches popstate event listener
     * @param {String} route Optional, the route to navigate to
     * @returns {void}
     */
    static attachListener(route) {
        route && Route.go(route)
        document.addEventListener("popstate", listenerFunction)
    }

    /**
     * Detaches popstate event listener
     * @returns {void}
     */
    static detachListener() {
        document.removeEventListener("popstate", listenerFunction)
    }
}

module.exports = Route
