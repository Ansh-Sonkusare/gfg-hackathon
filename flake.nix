{
  description = "Teak Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = with pkgs;
          mkShell {
            packages = [
              nodejs
              bun
              nodePackages.pnpm
              nodePackages."ts-node"
              nodePackages.vercel
              nodePackages."vscode-langservers-extracted"
              nodePackages.eslint
              nodePackages.eslint_d
              nodePackages.typescript
              prettierd
            ];
            shellHook = ''
              export SHELL=$(which zsh)
              export NVIM_APPNAME=nvim-chad
            '';
          };
      });
}
