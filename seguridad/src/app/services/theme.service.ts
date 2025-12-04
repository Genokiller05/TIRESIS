import { Injectable, Inject, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  public currentTheme: BehaviorSubject<'light' | 'dark'>;

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    let initialTheme: 'light' | 'dark' = 'dark';
    if (isPlatformBrowser(this.platformId)) {
      initialTheme = localStorage.getItem('app-theme') as 'light' | 'dark' || 'dark';
    }
    
    this.currentTheme = new BehaviorSubject(initialTheme);

    this.currentTheme.subscribe(theme => {
      if (isPlatformBrowser(this.platformId)) {
        if (theme === 'dark') {
          this.renderer.addClass(document.body, 'dark');
        } else {
          this.renderer.removeClass(document.body, 'dark');
        }
        localStorage.setItem('app-theme', theme);
      }
    });
  }

  public setTheme(theme: 'light' | 'dark') {
    this.currentTheme.next(theme);
  }
}
