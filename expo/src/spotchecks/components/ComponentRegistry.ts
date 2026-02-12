import React from 'react';

class ComponentRegistry {
  private components: Record<string, React.ComponentType<any>> = {};

  register(name: string, component: React.ComponentType<any>) {
    this.components[name] = component;
  }

  get(name: string): React.ComponentType<any> | undefined {
    return this.components[name];
  }

  getAll(): Record<string, React.ComponentType<any>> {
    return { ...this.components };
  }

  has(name: string): boolean {
    return name in this.components;
  }

  list(): string[] {
    return Object.keys(this.components);
  }
}

export const componentRegistry = new ComponentRegistry();
